const mongoose  = require('mongoose'),
      ObjectId  = require('mongodb').ObjectID;
var Manager     = require('../models/managerSchema');
var confSession = require('../models/sessionSchema');
var lecture     = require('../models/lectureSchema');
var Conf        = require('../models/conferenceSchema');
var qrcodeApi   = require('./qrcodeService')
// var ts         = require('../services/track.service');
const consts      = require('../consts.js');

let service = {};

// service.createSession           = createSession;
service.getConfSessionByName    = getConfSessionByName;
service.getConfById             = getConfById;
service.addSessionToConf        = addSessionToConf;
service.createLecture           = createLecture;
service.addLectureToConf        = addLectureToConf;
service.createConference        = createConference;
service.removeSession           = removeSession;
service.removeLecture           = removeLecture;
service.getAllLectures          = getAllLectures;
service.addManyLectures         = addManyLectures;
service.createProgram           = createProgram;
service.getAllConfs             = getAllConfs;
service.addVisitorTocConf       = addVisitorTocConf;
service.addPreffered_lectures   = addPreffered_lectures;
service.getAllLecturesByTopic   = getAllLecturesByTopic;
service.getLectureById          = getLectureById;
service.createManager           = createManager;
service.getManagerById          = getManagerById;
service.getAllConfById          = getAllConfById;
service.removeConf              = removeConf;
service.addTopic              = addTopic;

module.exports = service;

function createManager(first_name,last_name, linkdin, education, occupation){
    return new Promise((resolve, reject) => {
        Manager.findOne({linkdin : linkdin},
            (err, manager) => {
                if (err){
                    console.log("error: " + err);
                    reject("error");
                }
                if(manager) {
                    console.log("info : exist linkdin profile");
                    return resolve("info : exist linkdin profile");
                }
                else{
                    console.log('Trace: createManager('+first_name+','+last_name+')');
                    let newManager = new Manager({
                        name :{first_name:first_name,last_name:last_name},
                        linkedin : linkdin,
                        education : education,
                        occupation : occupation,
                    });
                    console.log('createManager STATUS: SUCCESS ' + first_name);
                    newManager.save((err, manager) => {
                        if (err){
                            console.log("error: " + err);
                            reject("error");
                        }
                        else{
                            console.log("new manager: " + manager);
                            resolve(manager);
                        }
                    });
                }
            })
    });
}


function addVisitorTocConf(visitorid, confid){
  var visitor=[];
  visitor.push({"visitorid":visitorid,"preffered_lectures":[],"mainTopic":""});

  console.log('Trace: addVisitorTocConf('+visitorid+','+confid+')');
    Conf.findByIdAndUpdate(confid,
    {$push: {visitors: visitor}},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
        }else{
        console.log("success "+confid+" updated");
        }
    }
  );
}

function addPreffered_lectures(visitorid, confid,preffered_lectures){
  console.log("preffered_lectures"+preffered_lectures);
  console.log('Trace: addPreffered_lecturesToConf('+visitorid+','+confid+')');
  preffered_lectures.forEach(function(lecture) {
      addRating(lecture,confid);
    });
  Conf.update(
      {
          "_id" :confid,
          "visitors.visitorid": visitorid
      },
      {
          "$set": {
              "visitors.$.preffered_lectures": preffered_lectures
          }
      },
        function(err, doc) {
            if(err){
            console.log(err);
            }else{
            console.log("success "+confid+" updated");
            }
        }
    );
}

function addTopic(visitorid, confid,mainTopic){
  console.log("addTopic"+mainTopic);
  console.log('Trace: addTopic('+visitorid+','+mainTopic+')');
  Conf.update(
      {
          "_id" :confid,
          "visitors.visitorid": visitorid
      },
      {
          "$set": {
              "visitors.$.mainTopic": mainTopic
          }
      },
        function(err, doc) {
            if(err){
            console.log(err);
            }else{
            console.log("success "+confid+" updated");
            }
        }
    );
}

function addRating(lecture1,confid){
  console.log('Trace: addRating('+lecture1+')');
  Conf.update(
  {
      "_id" :confid,
      "lectures._id":lecture1
  },
  {
      "$inc": {
          "lectures.$.ratings": 1
      }
  },
    function(err, doc) {
        if(err){
        console.log(err);
        }else{
        console.log("success "+lecture1+" updated");
        }
    }
);
}


function createConference(name, type, logo, start_date, duration, location, audience, main_topics, managerId){
  return new Promise((resolve, reject) => {
    Conf.findOne({name : name},
      (err, cnf) => {
        if (err){
          console.log("error: " + err);
          reject("error");
        }
        if(cnf) {
            console.log("info : exist NAME");
            return resolve(false);
        }
        else{
          console.log('Trace: createConference('+name+','+type+')');
            let newConfernce = new Conf({
            name : name,
            type : type,
            logo : logo,
            start_date : start_date,
            duration : duration,
            audience : audience,
            location : location,
            main_topics : main_topics,
            qr_code : ''
          });
          console.log('createConference STATUS: SUCCESS ' + name);
          newConfernce.save((err, cnf) => {
            if (err){
              console.log("error: " + err);
              reject("error");
            }
            else{
              qrcodeApi.createImage(cnf["_id"],cnf["name"], 'conference', function(qr_code, err){
                if (!qr_code){
                    console.log("failed to create qr_code");
                    reject(err);
                }
                doc = {
                  qr_code: qr_code
                };
                Conf.update({_id: cnf["_id"]}, doc, function(err, raw) {
                  if (err){
                    reject ("could not update qr_code")
                  }
                  else{
                    console.log("Added qr_code to "+ cnf["_id"]);
                  }
                });
                console.log("new conference: " + cnf);
                addConfToManager(managerId, cnf._id);
                resolve(cnf);
              })

            }
          })
        }
      })
  });
}

function createLecture(name, lecturer_name, description, topic, ratings){
  return new Promise((resolve, reject) => {
    lecture.findOne({name : name},
      (err, lct) => {
        if (err){
          console.log("error: " + err);
          reject("error");
        }
        if(lct) {
            console.log("info : exist NAME");
            return resolve("error : exist NAME");
        }
        else{
          console.log('Trace: createLecture('+name+','+lecturer_name+')');
            let newLecture = new lecture({
            name : name,
            lecturer_name : lecturer_name,
            description : description,
            topic : topic,
            ratings : ratings
          });
          console.log('CREATE LECTURE STATUS: SUCCESS ' + name);
          newLecture.save((err, lct) => {
            if (err){
              console.log("error: " + err);
              reject("error");
            }
            else{
              qrcodeApi.createImage(lct["_id"],lct["name"], 'lecture', function(qr_code, err){
                if (!qr_code){
                    console.log("failed to create qr_code");
                    reject("failed to create qr_code");
                }
                doc = {
                  qr_code: qr_code
                };
                lecture.update({_id: lct["_id"]}, doc, function(err, raw) {
                  if (err){
                    reject ("could not update qr_code");
                  }
                  else{
                    console.log("Added qr_code to "+ lct["_id"]);
                    lct.qr_code=qr_code;
                    console.log("new lcture: " + lct);
                    resolve(lct);
                  }
                });
              });

            }
          })
        }
      })
  });
}

function getConfSessionByName(name){
  console.log("Trace: getConfSessionByName("+name+")");
  return new Promise((resolve, reject) => {
    confSession.findOne({name: name},
      (err, _cSession) => {
        if(err) {
          console.log('getConfSessionByName STATUS: FAILED');
          reject({"error": err});
        }
        console.log('getConfSessionByName STATUS: SUCCESS');
        if(!_cSession) {
          console.log("info : wrong name");
          return resolve({"info": " wrong name"});
        }
        resolve(_cSession.session_type);
      });
  });
}

function removeSession(confId, sessionName) {
  console.log('Trace: removeSession('+confId+','+sessionName+')');
  return new Promise((resolve,reject) => {
    let conf = getConfById(confId).then((cnf)=> {
      for(let pIndex = 0; pIndex < cnf.program.length; pIndex++) {
        if(cnf.program[pIndex].name === sessionName) {
          console.log(`found session: ${cnf.program[pIndex].name}`);
          cnf.program.splice(pIndex,1);
          cnf.save((err) => {
            if(err) {
              console.log(`err: ${err}`);
              resolve(false);
            }
            else {
              console.log(`Saved document: ${cnf.name}`);
            }
          });
          resolve(true);
          return;
        }
      }
      console.log("session not found");
      resolve("failed - session not found");
    });
  });
}

function getConfById(confId){
  return new Promise((resolve, reject) => {
    console.log("conf id: " + confId);
    Conf.findOne({_id: ObjectId(confId)},
        (err, conf) => {
          if(err) {
            console.log('getConfById STATUS: FAILED');
            reject(err);
          }
          console.log('getConfById STATUS: SUCCESS');
          if(!conf) {
            console.log("info : wrong conf id");
            return resolve("error : wrong conf id");
          }
          resolve(conf);
        });
  });
}

function getManagerById(managerId){
    return new Promise((resolve, reject) => {
        console.log("conf id: " + managerId);
        Manager.findOne({_id: ObjectId(managerId)},
            (err, manager) => {
                if(err) {
                    console.log('getManagerById STATUS: FAILED');
                    reject(err);
                }
                console.log('getManagerById STATUS: SUCCESS');
                if(!manager) {
                    console.log("info : wrong manager id");
                    return resolve("error : wrong manager id");
                }
                resolve(manager);
            });
    });
}

function getAllConfById(managerId) {
    return new Promise((resolve, reject) => {
        let manager = getManagerById(managerId).then((manager) =>{
            if(manager.confs.length === 0){
                console.log("no confs");
                reject("no confs");
            }
            let confObjectId = [];
            manager.confs.forEach((cnf) => {
               confObjectId.push(ObjectId(cnf.confId));
            });
            console.log("object id array: " + confObjectId);
            getAllConfByArray(confObjectId).then((confs) =>{
                console.log("confs");
                resolve(confs);
            });
            // setAllConfs(manager).then((confs)=>{
            //     // console.log("my confs: " + confs);
            //     resolve(confs);
            // });
        });
    });
}

function getAllConfByArray(confObjectId) {
    return new Promise((resolve, reject) => {
        Conf.find({'_id' : {$in: confObjectId}},
            (err, confs) => {
                if(err) {
                    console.log('getAllConfs STATUS: FAILED');
                    reject(err);
                }
                console.log('getAllConfs STATUS: SUCCESS');
                if(!confs) {
                    console.log("info : No confs probably not");
                    return resolve("info : No confs probably not");
                }
                resolve(confs);
            });
    });
}

function setAllConfs(manager){
    return new Promise((resolve, reject) =>{
    // let actions = items.map(fn);
        let confs = [];
        manager.confs.forEach((conf, index, array) =>{
            getConfById(conf.confId).then((cnf) =>{
                confs.push(cnf);
                console.log("cnf name: " +cnf.name);
                if (index === array.length -1) resolve(confs);
            })
        })
    });
}

function getLectureById(lectureId){
  return new Promise((resolve, reject) => {
    console.log("lect id: " + lectureId);
    lecture.findOne({_id: ObjectId(lectureId)},
        (err, lct) => {
          if(err) {
            console.log('getLectureById STATUS: FAILED');
            reject(err);
          }
          console.log('getLectureById STATUS: SUCCESS');
          if(!lct) {
            console.log("info : wrong lct id");
            return resolve("info : wrong lct id");
          }
          resolve(lct);
        });
  });
}

function addLectureToConf(lectureId, confId) {
  console.log('Trace: addLectureToConf('+lectureId+','+confId+')');
  return new Promise((resolve, reject) => {
    let conf = getConfById(confId).then((conf)=> {
      let _lecture = getLectureById(lectureId).then((lct) => {
        for(let pIndex = 0; pIndex < conf.lectures.length; pIndex++) {
          if(conf.lectures[pIndex].name === lct.name) {
            console.log(`found lecture: ${conf.lectures[pIndex].name}`);
            reject("failed - lecture exist in the conf");
            return;
          }
        }
        conf.lectures.push(lct);
        conf.save((err) => {
          if(err){
            console.log(`err: ${err}`);
            resolve(false);
          }
          else{
            console.log(`Saved document: ${conf.name}`);
            resolve(conf.lectures);
          }
        });
      })
    });
  });
}

function removeLecture(confId, lectureName) {
    console.log('Trace: removeLecture('+confId+','+lectureName+')');
    return new Promise((resolve,reject) => {
        let conf = getConfById(confId).then((cnf)=> {
            for(let pIndex = 0; pIndex < cnf.lectures.length; pIndex++) {
                if(cnf.lectures[pIndex].name === lectureName) {
                    console.log(`found lecture: ${cnf.lectures[pIndex].name}`);
                    cnf.lectures.splice(pIndex,1);
                    cnf.save((err) => {
                        if(err) {
                            console.log(`err: ${err}`);
                            reject(err);
                        }
                        else {
                            console.log(`lecture remove: ${cnf.lectures}`);
                        }
                    });
                    resolve(cnf.lectures);
                    return;
                }
            }
            console.log("lecture not found");
            resolve("failed - lecture not found");
        });
    });
}

function addSessionToConf(name, session_type, duration, dayNum, time, confId) {
  console.log('Trace: addSessionToConf('+name+','+session_type+','+confId+')');
  return new Promise((resolve, reject) => {
    let conf = getConfById(confId).then((conf)=> {
      for(let pIndex = 0; pIndex < conf.program.length; pIndex++) {
        if(conf.program[pIndex].name === name) {
          console.log(`found session, TRY DIFFERENT NAMEE: ${conf.program[pIndex].name}`);
          resolve("failed - name exist");
          return;
        }
      }
      let newSession = new confSession({
        name : name,
        session_type : session_type,
        duration : duration,
        dayNum : dayNum,
        time : time,
      });
      conf.program.push(newSession);
      conf.save((err) => {
        if(err){
          console.log(`err: ${err}`);
          resolve(`err: ${err}`);
        }
        else {
          console.log(`Saved document: ${conf.program}`);
          resolve(`Saved document: ${conf.program}`);
        }
      });
    });
  });
}

function getAllLectures(){
    return new Promise((resolve, reject) => {
        console.log("getAllLectures ");
        lecture.find(
            (err, lct) => {
                if(err) {
                    console.log('getAllLectures STATUS: FAILED');
                    reject(err);
                }
                console.log('getAllLectures STATUS: SUCCESS');
                if(!lct) {
                    console.log("info : No lectures probably not");
                    return resolve("info : No lectures probably not");
                }
                resolve(lct);
            });
    });
}

function getAllConfs(){
    return new Promise((resolve, reject) => {
        console.log("getAllConfs ");
        Conf.find(
            (err, confs) => {
                if(err) {
                    console.log('getAllConfs STATUS: FAILED');
                    reject(err);
                }
                console.log('getAllConfs STATUS: SUCCESS');
                if(!confs) {
                    console.log("info : No confs probably not");
                    return resolve("info : No confs probably not");
                }
                resolve(confs);
            });
    });
}

function addManyLectures(confLectures, confId){
    console.log('Trace: addManyLectures('+confLectures+','+confId+')');
    return new Promise((resolve, reject) => {
        Conf.update({
            "_id":confId
        },{
            "$set":{
                "lectures" : confLectures,
                // "main_topics": confTopics
            }
        },
            function(err, conf){
                if(err){
                    console.log("err: " + err);
                    reject(err);
                }
                else{
                    console.log("success: " + conf);
                    resolve(conf);
                }
            })
    });
}

function createProgram(confSessions, confId){
    console.log('Trace: createProgram('+confSessions+','+confId+')');
    return new Promise((resolve, reject) => {
        let conditions = {_id: ObjectId(confId)},
            update = {"program" : confSessions},
            opts = {new:true};
        Conf.update(conditions, update, opts,
            (err, obj) => {
                if(err) {
                    reject({"error": err});
                    console.log('createProgram STATUS: FAILED' + err);
                } else{
                    console.log(`createProgram STATUS: SUCCESS`);
                    resolve(obj);
                }
            });
    });
}

function getAllLecturesByTopic(topics){
    return new Promise((resolve, reject) => {
        console.log("getAllLecturesByTopic " + topics);
        lecture.find({topic: { $in: topics }}).exec(
            (err, lct) => {
                if(err) {
                    console.log('getAllLecturesByTopic STATUS: FAILED');
                    reject(err);
                }
                console.log('getAllLecturesByTopic STATUS: SUCCESS');
                if(!lct) {
                    console.log("info : No lectures probably not");
                    return resolve("info : No lectures probably not");
                }
                resolve(lct);
            });
    });
}

function addConfToManager(managerId, confId){
  var conf=[];
  conf.push({"confId":confId,"confname":'test'});

  console.log('Trace: addConfToManager('+managerId+','+confId+')');
    Manager.findByIdAndUpdate(managerId,
    {$push: {confs: conf}},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
        }else{
        console.log("success "+confId+" updated");
        }
    }
  );
}

function removeConf(confId, managerId) {
  console.log('Trace: removeConf('+confId+','+managerId+')');
  return new Promise((resolve,reject) => {
    Conf.remove({ _id: ObjectId(confId) }, function (err) {
      if (err) return handleError(err);
      else console.log('Removed!');
    });
    Manager.findByIdAndUpdate(managerId,{$pull: {confs: {confId: ObjectId(confId)}}},
        function(err, doc) {
            if(err){
                console.log(err);
                reject(err);
            }else{
                console.log("success "+confId+" updated");
                resolve(doc);
            }
        }
    );
  });
}

function login(username, password){
    return new Promise((resolve, reject) => {
      User.findOne({username: username},
        (err, user) => {
          if(err) {
            reject({"error": err});
            console.log('LOGIN STATUS: FAILED');
          }

          if(!user) {
            console.log("info : wrong username");
            return resolve({"info": " wrong username"});
          }
          if(!(user.password === password)) {
            console.log("info : wrong password");
            return resolve({"info": " wrong password"});
          }
          console.log('LOGIN STATUS: SUCCESS ' + user.username);
          resolve({
                _id: user._id,
                username: user.username,
                token: jwt.sign({ sub: user._id }, consts.secret)
            });
        });
    });
}

const mongoose  = require('mongoose'),
      ObjectId  = require('mongodb').ObjectID;
var Manager     = require('../models/managerSchema');
var confSession = require('../models/sessionSchema');
var lecture     = require('../models/lectureSchema');
var Conf        = require('../models/conferenceSchema');
// var ts         = require('../services/track.service');
var consts      = require('../consts.js');

var service = {};

service.createSession           = createSession;
service.getConfSessionByName    = getConfSessionByName;
service.getConfById             = getConfById;
service.addSessionToConf        = addSessionToConf;
service.createLecture           = createLecture;
service.addLectureToConf        = addLectureToConf;
service.createConference        = createConference;
service.removeSession           = removeSession;
// service.getUserById             = getUserById;
// service.getPrefById             = getPrefById;
// service.getPlaylistsById        = getPlaylistsById;
// service.setPref                 = setPref;
// service.getUser                 = getUser;
// service.addTrackToPlaylist      = addTrackToPlaylist;
// service.addNewPlaylist          = addNewPlaylist;
// // service.removeTrackFromPlaylist = removeTrackFromPlaylist;
// service.removePlaylist          = removePlaylist;
// service.create                  = create;
// service.delete = _delete;

module.exports = service;

function createSession(name, session_type, duration){
  return new Promise((resolve, reject) => {
    confSession.findOne({name : name},
      (err, _cSession) => {
        if (err){
          console.log("error: " + err);
          reject("error");
        }
        if(_cSession) {
            console.log("info : exist NAME");
            return resolve("error : exist NAME");
        }
        else{
          console.log('Trace: createSession('+name+','+session_type+')');
          var newSession = new confSession({
            name : name,
            session_type : session_type,
            duration : duration
          });
          console.log('CREATE SESSION STATUS: SUCCESS ' + name);
          newSession.save((err, confSession) => {
            if (err){
              console.log("error: " + err);
              reject("errorr");
            }
            else{
              console.log("new session: " + confSession);
              resolve(confSession);
            }
          })
        }
      })
  });
}

function createConference(name, type, logo, start_date, end_date, location, audience){
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
          var newConfernce = new Conf({
            name : name,
            type : type,
            logo : logo,
            start_date : start_date,
            end_date : end_date,
            audience : audience,
            location : location
          });
          console.log('createConference STATUS: SUCCESS ' + name);
          newConfernce.save((err, cnf) => {
            if (err){
              console.log("error: " + err);
              reject("error");
            }
            else{
              console.log("new conference: " + cnf);
              resolve(cnf);
            }
          })
        }
      })
  });
}

function createLecture(name, lecturer_name, description, duration){
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
          var newLecture = new lecture({
            name : name,
            lecturer_name : lecturer_name,
            description : description,
            duration : duration
          });
          console.log('CREATE LECTURE STATUS: SUCCESS ' + name);
          newLecture.save((err, lct) => {
            if (err){
              console.log("error: " + err);
              reject("error");
            }
            else{
              console.log("new session: " + lct);
              resolve(lct);
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
              return;
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

function getLectureById(lectureId){
  return new Promise((resolve, reject) => {
    console.log("conf id: " + lectureId);
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
            return;
          }
          else{
            console.log(`Saved document: ${conf.name}`);
            resolve("conf.lectures");
          }
        });  
      })
    });
  });
}

function addSessionToConf(name, session_type, duration, confId) {
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
      var newSession = new confSession({
        name : name,
        session_type : session_type,
        duration : duration
      });
      conf.program.push(newSession);
      conf.save((err) => {
        if(err){
          console.log(`err: ${err}`);
          resolve(`err: ${err}`);
          return;
        }
        else {
          console.log(`Saved document: ${conf.name}`);
          resolve(`Saved document: ${conf.name}`);
        }
      });
    });
  });
}

function addNewPlaylist(userId, playlistName){
  console.log('Trace: addTrackToPlaylist('+userId+','+playlistName+')');
  return new Promise((resolve, reject) => {
    let user = getUserById(userId).then((user)=> {
      user.playlists.push({"name":playlistName, "tracks":[]});
      user.save((err) => {
        if(err){
          console.log(`err: ${err}`);
          resolve(false);
          return;
        }
        else
          console.log(`Saved document: ${user.username}`);
      });
    resolve(true);
    });
  });
}

function create(username, password){
    var preferences = [];
    preferences.push({"name":"detriot","value":0});
    preferences.push({"name":"hard","value":0});
    preferences.push({"name":"dance","value":0});
    preferences.push({"name":"minimal","value":0});
    preferences.push({"name":"classic","value":0});
    preferences.push({"name":"house","value":0});
    preferences.push({"name":"vgm","value":0});
    preferences.push({"name":"hard_acid","value":0});
    preferences.push({"name":"electro","value":0});
    return new Promise((resolve, reject) => {
      User.findOne({username: username},
        (err, user) => {
          if(err) {
            reject({"error": err});
            console.log('REGISTER STATUS: FAILED');
          }
          
          if(user) {
            console.log("info : exist username");
            return resolve({"info": " exist username"});
          }
          else{
            console.log('REGISTER STATUS: SUCCESS ' + username);
            var newUser = new User({
              username : username,
              password : password,
              preferences : preferences
            });
            newUser.save(
              (err) => {
                if(err)
                  console.log('error: ' + err);
                else
                  console.log("save new user");
                  resolve();
              });
        }
    });
  });
}

function getUserById(userId){
  return new Promise((resolve, reject) => {
    User.findOne({_id: ObjectId(userId)},
        (err, user) => {
          if(err) {
            reject(err);
            console.log('getUser STATUS: FAILED');
          }
          console.log('getUser STATUS: SUCCESS');
          if(!user) {
            console.log("info : wrong username");
            return resolve(err);
          }
          resolve(user);
        });
  });
}
function getUser(userId){
  return new Promise((resolve, reject) => {
    User.findOne({_id: ObjectId(userId)},
        (err, user) => {
          if(err) {
            reject(err);
            console.log('getUser STATUS: FAILED');
          }
          console.log('getUser STATUS: SUCCESS');
          if(!user) {
            console.log("info : wrong username");
            return resolve(err);
          }
          resolve(user);
        });
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
function getPrefById(userId){
  console.log("Trace: getPrefById("+userId+")");
  return new Promise((resolve, reject) => {
    User.findOne({_id: ObjectId(userId)},
      (err, user) => {
        if(err) {
          console.log('getPrefById STATUS: FAILED');
          reject({"error": err});
        }
        console.log('getPrefById STATUS: SUCCESS');
        if(!user) {
          console.log("info : wrong username");
          return resolve({"info": " wrong username"});
        }
        resolve(user.preferences);
      });
  });
}
function setPref(userId, userParam) {
  console.log("Trace: setPrefById("+userId+")");
    return new Promise((resolve, reject) => {
          var obj = JSON.parse(userParam);
          var conditions = {_id: ObjectId(userId)},
          update = {'preferences.0.value':obj[0].value,
                    'preferences.1.value':obj[1].value,
                    'preferences.2.value':obj[2].value,
                    'preferences.3.value':obj[3].value,
                    'preferences.4.value':obj[4].value,
                    'preferences.5.value':obj[5].value,
                    'preferences.6.value':obj[6].value,
                    'preferences.7.value':obj[7].value,
                    'preferences.8.value':obj[8].value,
                    },
          opts = {new:true};
          User.update(conditions, update, opts,
            (err) => {
                if(err) {
                  reject({"error": err});
                  console.log('updatePREF STATUS: FAILED' + err);
                } else{
                  console.log(`updatePREF STATUS: SUCCESS`);
                }
            });
          resolve(obj);
    });
}

function addTrackToPlaylist(trackId, userId, playlistName) {
  console.log('Trace: addTrackToPlaylist('+trackId+','+userId+','+playlistName+')');
  return new Promise((resolve, reject) => {
    let user = getUserById(userId).then((user)=> {
      user.playlists.forEach(function(pl) {
        if(pl.name === playlistName){
          ts.getTrackById(trackId).then ((trk) => {
            pl.tracks.push(trk);
            user.save((err) => {
              if(err){
                console.log(`err: ${err}`);
                resolve(false);
                return;
              }
              else
                console.log(`Saved document: ${user.username}`);
            });
          }); 
        }
      });
    resolve(true);
    });
  });
}
function removeTrackFromPlaylist(trackId, userId, playlistName) {
  console.log('Trace: removeTrackFromPlaylist('+trackId+','+userId+','+playlistName+')');
  return new Promise((resolve,reject) => {
    let user = getUserById(userId).then((user)=> {
      for(let pIndex = 0; pIndex < user.playlists.length; pIndex++) {
        if(user.playlists[pIndex].name === playlistName) {
          console.log(`found playlist: ${playlistName}`);
          for(let tIndex = 0; tIndex < user.playlists[pIndex].tracks.length; tIndex++) {
            if(user.playlists[pIndex].tracks[tIndex].name === trackId){
              console.log(`found track in playlist`);
              user.playlists[pIndex].tracks.splice(tIndex,1);
              user.save((err) => {
                if(err) {
                  console.log(`err: ${err}`);
                  resolve(false);
                  return;
                }
                else {
                  console.log(`Saved document: ${user.username}`);
                  resolve(true);
                  return;
                }   
              });
            }  
          }
        }
      }
    });
    resolve(false);
  });
}

function removePlaylist(userId, playlistName) {
  console.log('Trace: removePlaylist('+userId+','+playlistName+')');
  return new Promise((resolve,reject) => {
    let user = getUserById(userId).then((user)=> {
      for(let pIndex = 0; pIndex < user.playlists.length; pIndex++) {
        if(user.playlists[pIndex].name === playlistName) {
          console.log(`found playlist: ${playlistName}`);
          user.playlists.splice(pIndex,1);
          user.save((err) => {
            if(err) {
              console.log(`err: ${err}`);
              resolve(false);
              return;
            }
            else {
              console.log(`Saved document: ${user.username}`);
              return resolve(true);
            }   
          });
        }
      }
    });
    resolve(false);
  });
}
function getPlaylistsById(userId){
  console.log("Trace: getPlaylistsById("+userId+")");
  return new Promise((resolve, reject) => {
    User.findOne({_id: ObjectId(userId)},
      (err, user) => {
        if(err) {
          console.log('getPlaylistsById STATUS: FAILED');
          reject({"error": err});
        }
        if(!user) {
          console.log("info : wrong username");
          return resolve({"info": " wrong username"});
        }
        console.log('getPlaylistsById STATUS: SUCCESS');
        resolve(user.playlists);
      });
  });
}
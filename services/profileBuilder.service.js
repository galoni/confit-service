const mongoose  = require('mongoose'),
      ObjectId  = require('mongodb').ObjectID;
var Visitor     = require('../models/visitorSchema');
var ProfilePie     = require('../models/profile_pieSchema');
var qrcodeApi   = require('./qrcodeService')
var consts      = require('../consts.js');
var Conf        = require('../models/conferenceSchema');
const managerService = require('./manager.service');

var service = {};

//service.buildPie= buildPie;
service.createVisitor=createVisitor;
service.registerToConf=registerToConf;
service.getVisitorById=getVisitorById;
service.updateProfilePie=updateProfilePie;
service.updatePreffered_lectures=updatePreffered_lectures;
service.setTopics=setTopics;
//service.matching=matching;

//service.getPie=getPie;

module.exports = service;

/*function matching(visitorid,confid){
    let matching_people=[];
}*/
/*function getPie(visitorid){
  return new Promise((resolve, reject) => {
    console.log("visitor id: " + visitorid);
    Visitor.findOne({_id: ObjectId(visitorid)},
        (err, visitor) => {
          if(err) {
            console.log('getPie STATUS: FAILED');
            reject(err);
          }
          console.log('getPie STATUS: SUCCESS');
          if(!pie) {
            console.log("info : wrong visitor id");
            return resolve("info : wrong visitor id");
          }
          resolve(visitor.profile_pie);
        });
  });
}*/

function createVisitor(first_name,last_name, linkdin, education, occupation){
  return new Promise((resolve, reject) => {
    Visitor.findOne({linkdin : linkdin},
      (err, visitor) => {
        if (err){
          console.log("error: " + err);
          reject("error");
        }
        if(visitor) {
            console.log("info : exist linkdin profile");
            return resolve(false);
        }
        else{
          console.log('Trace: createVisitor('+first_name+','+last_name+')');
          var newVisitor = new Visitor({
              name :{first_name:first_name,last_name:last_name},
              linkedin : linkdin,
              education : education,
              occupation : occupation,
              qr_code : ''
          });
          console.log('createVisitor STATUS: SUCCESS ' + first_name);
          newVisitor.save((err, visitor) => {
            if (err){
              console.log("error: " + err);
              reject("error");
            }
            else{
              qrcodeApi.createImage(visitor["_id"],visitor["linkedin"], 'visitor', function(qr_code, err){
                if (!qr_code){
                    console.log("failed to create qr_code");
                    reject("failed to create qr_code");
                }
                doc = {
                  qr_code: qr_code
                }
                Visitor.update({_id: visitor["_id"]}, doc, function(err, raw) {
                  if (err){
                    reject ("could not update qr_code")
                  }
                  else{
                    console.log("Added qr_code to "+ visitor["_id"]);
                  }
                })
                console.log("new newVisitor: " + visitor);
                resolve(visitor);
              })

            }
          })
        }
      })
  });
}

function registerToConf
(visitorid, confid,confname,connection_precent,learn_precent,explore_precent) {
  console.log("Trace: registerToConf("+confid+") by visitor: ("+visitorid+")");
    var all=parseInt(connection_precent)+parseInt(learn_precent)+parseInt(explore_precent);
    console.log("all=" + all);
    connection_precent=parseInt(connection_precent)/all;
    learn_precent=parseInt(learn_precent)/all;
    explore_precent=parseInt(explore_precent)/all;
    console.log("precent " + connection_precent);
    var profilePie=connection_precent*0.001
    +explore_precent*0.01+learn_precent*0.1;
    var confs=[];
    confs.push({"confId":confid,
                "confname":confname,
               "connection_precent":connection_precent,
               "explore_precent":explore_precent,
               "learn_precent":learn_precent,
               "profile_pie":profilePie,
               "preffered_lectures":[]})
      return new Promise((resolve, reject) => {
      let visitor = getVisitorById(visitorid).then((visitor) => {
          console.log(visitor);
        for(let pIndex = 0; pIndex < visitor.confs.length; pIndex++) {
          if(visitor.confs[pIndex].confId === confid) {
            console.log(`found conf: ${visitor.confs[pIndex].confId}`);
            reject("failed - conf exist in the confs array");
            return;
          }
        }
        visitor.confs.push(confs[0]);
        visitor.save((err) => {
          if(err){
            console.log(`err: ${err}`);
            resolve(false);
          }
          else{
            console.log(`Saved document: ${visitor._id}`);
            managerService.addVisitorTocConf(visitorid,confid);

            resolve(true);
          }
        });
      })
  });
}

function getVisitorById(visitorid){
  return new Promise((resolve, reject) => {
    console.log("visitor id: " + visitorid);
    Visitor.findOne({_id: ObjectId(visitorid)},
        (err, visitor) => {
          if(err) {
            console.log('getVisitorById STATUS: FAILED');
            reject(err);
          }
          console.log('getVisitorById STATUS: SUCCESS');
          if(!visitor) {
            console.log("info : wrong visitor id");
            return resolve("error : wrong visitor id");
          }
          resolve(visitor);
        });
  });
}
function updateProfilePie(visitorid,confid ,lecture1,lecture2,lecture3) {
  var visitorOn;
  var confOn;
  var lecturesOn;
  var lecturesID=[];
  var numoflectures;
  var topicOn;
  var topics;
  var value_topics=[0.1,0.01,0.001];
  var value_topics_index=[1,2,3];
  var profile_pie_topics=0;
  var flag1,glag2,flag3=false;
  var profilePieExist;
  console.log("Trace: updateProfilePie("+visitorid+")");
  Visitor.findOne({_id: ObjectId(visitorid)},
      (err, visitor) => {
        if(err) {
          console.log('visitorFindOne STATUS: FAILED');
        }
        console.log('visitorFindOne STATUS: SUCCESS');
        if(!visitor) {
          console.log("info : wrong conf id");
          return resolve("error : wrong conf id");
        }
        this.visitorOn=visitor;
        Conf.findOne({_id: ObjectId(confid)},
            (err, conf) => {
              if(err) {
                console.log('confFindOne STATUS: FAILED');
              }
              console.log('confFindOne STATUS: SUCCESS');
              if(!visitor) {
                console.log("info : wrong conf id");
                return resolve("error : wrong conf id");
              }
              this.confOn=conf;
              console.log("visitorOn :"+this.visitorOn);
              console.log("confOn :"+this.confOn);
              this.lecturesOn=this.confOn.lectures;
              this.numoflectures=this.confOn.lectures.length;
              this.topics=this.confOn.main_topics;
              console.log(this.topics);
              /*for(let i=0;i<this.numoflectures;i++){
                console.log("this.lecturesOn[i]._id :"+ this.lecturesOn[i]._id);
                lecturesID.push(JSON.stringify(this.lecturesOn[i]._id));
                //console.log("this.lecturesOn[i]._id :"+ this.lecturesOn[i]._id);
              }
              console.log(lecturesID);*/
              for(let i=0;i<this.numoflectures;i++){
                if(this.confOn.lectures[i]._id===lecture1){
                  this.topicOn=this.confOn.lectures[i].topic;
                  //console.log(this.topicOn);
                  var index = this.topics.indexOf(this.topicOn);
                  //console.log(index);
                  //console.log("this.value_topics[index]="+value_topics[index]);
                  //console.log("value_topics_index[index]="+value_topics_index[index]);
                  profile_pie_topics=profile_pie_topics+value_topics[index]*value_topics_index[index];
                  console.log("profilePie= "+profile_pie_topics);
                }
                else if(this.confOn.lectures[i]._id===lecture2){
                  this.topicOn=this.confOn.lectures[i].topic;
                  //console.log(this.topicOn);
                  var index = this.topics.indexOf(this.topicOn);
                  //console.log(index);
                  //console.log("this.value_topics[index]="+value_topics[index]);
                  //console.log("value_topics_index[index]="+value_topics_index[index]);
                  profile_pie_topics=profile_pie_topics+value_topics[index]*value_topics_index[index];
                  console.log("profilePie= "+profile_pie_topics);
                }
                else if(this.confOn.lectures[i]._id===lecture3){
                  this.topicOn=this.confOn.lectures[i].topic;
                  //console.log(this.topicOn);
                  var index = this.topics.indexOf(this.topicOn);
                  //console.log(index);
                  //console.log("this.value_topics[index]="+value_topics[index]);
                  //console.log("value_topics_index[index]="+value_topics_index[index]);
                  profile_pie_topics=profile_pie_topics+value_topics[index]*value_topics_index[index];
                  console.log("profilePie= "+profile_pie_topics);
                }
              }
              //console.log(this.visitorOn.confs.length);
              //console.log(this.confOn._id);
              for(let i=0;i<this.visitorOn.confs.length;i++){
                if(JSON.stringify(this.confOn._id)===JSON.stringify(this.visitorOn.confs[i].confId)){
                  profilePieExist=this.visitorOn.confs[i].profile_pie;
                  console.log(profilePieExist);
                }
              }
              console.log(profile_pie_topics);
              profilePieExist=profilePieExist*0.6+profile_pie_topics*0.4;

              console.log(profilePieExist);
              Visitor.update(
              {
                  "_id" :visitorid,
                  "confs.confId": confid
              },
              {
                  "$set": {
                      "confs.$.profile_pie": profilePieExist
                  }
              },
              function(err, doc) {
                  if(err){
                  console.log(err);
                      //reject({"error": err});
                  }else{
                  console.log("success "+visitorid+" updated");
                      //managerService.addRating(lecture1,lecture2,lecture3);
                      //resolve(true);
                  }
              });

            });
      });
    /*return new Promise((resolve, reject) => {
          var conditions = {_id: ObjectId(visitorid)},
          update = {'profile_pie':profilePie,
                    'connection_percent':connection_percent,
                    'explore_percent':explore_percent,
                    'learn_percent':learn_percent
                    },
          opts = {new:true};
          Visitor.update(conditions, update, opts,
            (err) => {
                if(err) {
                  reject({"error": err});
                  console.log('updateProfilePie STATUS: FAILED' + err);
                } else{
                  console.log(`updateProfilePie STATUS: SUCCESS`);
                }
            });
          resolve(true);
    });*/
}



function updatePreffered_lectures
(visitorid,confid, lecture1,lecture2,lecture3) {
  console.log("Trace: updatePreffered_lectures("+visitorid+") To conference id ("+confid+")");
    var preffered_lectures=[];
    preffered_lectures.push(lecture1);
    preffered_lectures.push(lecture2);
    preffered_lectures.push(lecture3);
    return new Promise((resolve, reject) => {
    Visitor.update(
    {
        "_id" :visitorid,
        "confs.confId": confid
    },
    {
        "$set": {
            "confs.$.preffered_lectures": preffered_lectures
        }
    },
    function(err, doc) {
        if(err){
        console.log(err);
            reject({"error": err});
        }else{
        console.log("success "+visitorid+" updated");
            managerService.addPreffered_lectures(visitorid,confid,preffered_lectures);
            updateProfilePie(visitorid,confid,lecture1,lecture2,lecture3);
            //managerService.addRating(lecture1,lecture2,lecture3);
            resolve(true);
        }
    });
    });


      /*return new Promise((resolve, reject) => {
      var flag=false;
      let visitor = getVisitorById(visitorid).then((visitor) => {
        for(let pIndex = 0; pIndex < visitor.confs.length; pIndex++) {
          if(visitor.confs[pIndex].confId === confid) {
            //console.log(`found conf: ${visitor.confs[pIndex].confId}`);
            //reject("failed - conf exist in the confs array");
            //return;
            flag=true;
            visitor.confs[pIndex].preffered_lectures.push({"preffered_lectures":preffered_lectures});
          }
        }
        if(flag){
          visitor.save((err) => {
          if(err){
            console.log(`err: ${err}`);
            resolve(false);
          }
          else{
            console.log(`Saved document: ${visitor._id}`);
            resolve(true);
          }
        });
        }
        else{
            reject("failed - conf not exist in the confs array");
            return;
        }
      })
  });*/
}

function setTopics
(visitorid,confid, topic1,topic2,topic3) {
  console.log("Trace: setTopics("+visitorid+") To conference id ("+confid+")");
    var mainTopic=[];
    mainTopic.push(topic1);
    mainTopic.push(topic2);
    mainTopic.push(topic3);
    return new Promise((resolve, reject) => {
    Visitor.update(
    {
        "_id" :visitorid,
        "confs.confId": confid
    },
    {
        "$push": {
            "confs.$.mainTopic": mainTopic
        }
    },
    function(err, doc) {
        if(err){
        console.log(err);
            reject({"error": err});
        }else{
        console.log("success "+visitorid+" updated");

            resolve(true);
        }
    });
    });
}
/*function updatePreffered_lectures
(visitorid,confid, lecture1,lecture2,lecture3) {
  console.log("Trace: updatePreffered_lectures("+visitorid+") To conference id ("+confid+")");
    var preffered_lectures=[];
    preffered_lectures.push(lecture1);
    preffered_lectures.push(lecture2);
    preffered_lectures.push(lecture3);
  return new Promise((resolve, reject) => {
    let conf = getConfsVisitor(visitorid).then((confArray)=> {
        for(let pIndex = 0; pIndex < confArray.length; pIndex++) {
          if(conf[pIndex].confId === confid) {
            console.log(`found conf`);
            confArray[pIndex].preffered_lectures.push(preffered_lectures);
            return;
          }
        }
        confArray.save((err) => {
          if(err){
            console.log(`err: ${err}`);
            resolve(false);
            return;
          }
          else{
            console.log(`Saved document`);
            resolve("true");
          }
        });
    });
  });
}

function getConfsVisitor(visitorid){
  return new Promise((resolve, reject) => {
    console.log("visitor id: " + visitorid);
    Visitor.findOne({_id: ObjectId(visitorid)},
        (err, visitor) => {
          if(err) {
            console.log('getConfsVisitor STATUS: FAILED');
            reject(err);
          }
          console.log('getConfsVisitor STATUS: SUCCESS');
          if(!lct) {
            console.log("info : wrong visitor id");
            return resolve("info : wrong visitor id");
          }
          resolve(visitor.confs);
        });
  });
}*/

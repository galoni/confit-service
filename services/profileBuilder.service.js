const mongoose  = require('mongoose'),
      ObjectId  = require('mongodb').ObjectID;
var Visitor     = require('../models/visitorSchema');
var ProfilePie     = require('../models/profile_pieSchema');
var qrcodeApi   = require('./qrcodeService')
var consts      = require('../consts.js');
var Conf        = require('../models/conferenceSchema');
const managerService = require('./manager.service');

var service = {};

service.createVisitor=createVisitor;
service.registerToConf=registerToConf;
service.getVisitorById=getVisitorById;
service.updateProfilePie=updateProfilePie;
service.updatePreffered_lectures=updatePreffered_lectures;
service.setTopics=setTopics;
service.appendTopic=appendTopic;
service.appendPrefferedLecture=appendPrefferedLecture;
service.updatePercent=updatePercent;
service.matchingPeople=matchingPeople;
service.login = login;
service.getAllConfById = getAllConfById;

module.exports = service;



function matchingPeople(visitorid,confid){
  var visitors=[];
  var profilePie;

  return new Promise((resolve, reject) => {
    Visitor.findOne({_id: ObjectId(visitorid)},
        (err, visitor) => {
          if(err) {
            console.log('getVisitorById STATUS: FAILED');
            reject(err);
          }
          console.log('matchingPeople-getVisitorById STATUS: SUCCESS');
          for(let i=0;i<visitor.confs.length;i++){
            if(visitor.confs[i].confId===confid){
              profilePie=visitor.confs[i].profile_pie;
              console.log("profilePie on conf found="+profilePie);
            }
          }

              Visitor.aggregate([
                { $unwind :'$confs'},
                {$match: {
                      $and: [
                          {'confs.confId': confid },
                          {'confs.profile_pie': {$gt:profilePie-0.09, $lt:profilePie+0.1}}
                      ]
                 }},
                { $project : {profilePic:"$profilePic",matching:null,visitorfirstname:"$name.first_name",visitorlastname:"$name.last_name" ,confId : '$confs.confId', confName : '$confs.confname', profilePie : '$confs.profile_pie' } }
                ], function(err, result) {
                  if(err){console.log("error in aggregate");}
                  else{
                     //console.log(result);
                     visitors=result;
                     //console.log(visitors);
                     for (let j=0;j<visitors.length;j++){
                       var min=Math.min(profilePie,visitors[j].profilePie);
                       var max=Math.max(profilePie,visitors[j].profilePie)
                       var result=Math.floor((min/max)*100);
                       visitors[j].matching=result;
                     }
                    resolve(visitors)
                   }
               });
          });
        });
}


function createVisitor(email, password, firstName, lastName, linkedin, education, occupation){
  return new Promise((resolve, reject) => {
    Visitor.findOne({linkedin : linkedin},
      (err, visitor) => {
        if (err){
          console.log("error: " + err);
          reject("error");
        }
        if(visitor) {
            console.log("info : exist linkedin profile");
            return resolve(false);
        }
        else{
          console.log('Trace: createVisitor('+firstName+','+lastName+')');
          var newVisitor = new Visitor({
              name :{first_name:firstName,last_name:lastName},
              email : email,
              password : password,
              linkedin : linkedin,
              education : education,
              occupation : occupation,
              qr_code : '',
              profilePic:'41c9efe0-eea7-4387-9850-c6a1919d673d.png'
          });
          console.log('createVisitor STATUS: SUCCESS ' + firstName);
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
(visitorid, confid, confname, logo) {
  console.log("Trace: registerToConf("+confid+") by visitor: ("+visitorid+")");
  var visitorname;
    var confs=[];
    confs.push({"confId":confid,
                "confname":confname,
                "logo": logo,
               "profile_pie":0,
               "preffered_lectures":[]})
      return new Promise((resolve, reject) => {
      let visitor = getVisitorById(visitorid).then((visitor) => {
          console.log(visitor);
          visitorname=visitor.name;
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
            managerService.addVisitorTocConf(visitorid,confid,visitorname);

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
              if(!conf) {
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
              for(let i=0;i<this.numoflectures;i++){
                if(this.confOn.lectures[i]._id===lecture1){
                  this.topicOn=this.confOn.lectures[i].topic;

                  var index = this.topics.indexOf(this.topicOn);
                  console.log(index);

                  profile_pie_topics=profile_pie_topics+value_topics[index]*value_topics_index[index];
                  console.log("profile_pie_topics= "+profile_pie_topics);
                }
                else if(this.confOn.lectures[i]._id===lecture2){
                  this.topicOn=this.confOn.lectures[i].topic;
                  //console.log(this.topicOn);
                  var index = this.topics.indexOf(this.topicOn);
                  console.log(index);

                  profile_pie_topics=profile_pie_topics+value_topics[index]*value_topics_index[index];
                  console.log("profile_pie_topics= "+profile_pie_topics);
                }
                else if(this.confOn.lectures[i]._id===lecture3){
                  this.topicOn=this.confOn.lectures[i].topic;
                  var index = this.topics.indexOf(this.topicOn);
                  console.log(index);
                  profile_pie_topics=profile_pie_topics+value_topics[index]*value_topics_index[index];
                  console.log("profile_pie_topics= "+profile_pie_topics);
                }
              }

              console.log("profile_pie_topics="+profile_pie_topics);
              profile_pie_topics=profile_pie_topics*0.4;
              console.log("profile_pie_topics after * 0.4="+profile_pie_topics);

              Visitor.update(
              {
                  "_id" :visitorid,
                  "confs.confId": confid
              },
              {
                  "$set": {
                      "confs.$.profile_pie": profile_pie_topics
                  }
              },
              function(err, doc) {
                  if(err){
                  console.log(err);
                      //reject({"error": err});
                  }else{
                  console.log("success "+visitorid+" updated");
                  }
              });

            });
      });

}

function appendPrefferedLecture(visitorid,confid, lecture){
  console.log("Trace: appendPrefferedLecture("+visitorid+") To conference id ("+confid+") with lecture "+lecture);
    return new Promise((resolve, reject) => {
    Visitor.update(
    {
        "_id" :visitorid,
        "confs.confId": confid
    },
    {
        "$push": {
            "confs.$.preffered_lectures": lecture
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

function updatePreffered_lectures(visitorid,confid, lecture1,lecture2,lecture3) {
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
  }

    function updatePercent(visitorid,confid, connection_percent,learn_percent,explore_percent) {
      var profile_pie_exist;
      var confon;
      var visitorOn;
      console.log("Trace: updatePercent("+visitorid+") To conference id ("+confid+")");
      var all=parseInt(connection_percent)+parseInt(learn_percent)+parseInt(explore_percent);
      console.log("all=" + all);
      connection_percent=parseInt(connection_percent)/all;
      learn_percent=parseInt(learn_percent)/all;
      explore_percent=parseInt(explore_percent)/all;
      //console.log("precent " + connection_percent);
      var profilePie=connection_percent*0.001
      +explore_percent*0.01+learn_percent*0.1;
      profilePie=profilePie*0.6;
      console.log("profilePie *0.6="+profilePie);
      return new Promise((resolve, reject) => {

      Visitor.findOne({_id: ObjectId(visitorid)},
          (err, visitor) => {
            if(err) {
              console.log('getVisitorById STATUS: FAILED');
              //reject(err);
            }
            console.log('getVisitorById STATUS: SUCCESS');
            if(!visitor) {
              console.log("info : wrong visitor id");
              //return resolve("error : wrong visitor id");
            }
            this.visitorOn=visitor;
            //console.log("visitoron="+JSON.stringify(this.visitorOn));
            console.log("confid="+confid);
            for(let i=0;i<this.visitorOn.confs.length;i++){

              if(this.visitorOn.confs[i].confId===confid){
                //console.log("this.visitorOn.confs[i].confId="+this.visitorOn.confs[i].confId);
                //console.log("this.visitorOn.confs[i].profile_pie="+this.visitorOn.confs[i].profile_pie);
                profile_pie_exist=this.visitorOn.confs[i].profile_pie;
                //console.log("profile_pie_exist="+profile_pie_exist);
                console.log("found cofID, update profile_pie_exist to:"+profile_pie_exist);
                profile_pie_exist=profile_pie_exist+profilePie;
                console.log("summerize profile_pie, update profile_pie to:"+profile_pie_exist);
                console.log("this profile_pie_exist="+profile_pie_exist);
              Visitor.update(
              {
                  "_id" :visitorid,
                  "confs.confId": confid
              },
              {
                  "$set": {
                    "confs.$.connection_percent":connection_percent,
                    "confs.$.learn_percent":learn_percent,
                    "confs.$.explore_percent":explore_percent,

                      "confs.$.profile_pie": profile_pie_exist
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
              }
              }
            });
          });


}

function appendTopic(visitorid, confid, topic){
  console.log("Trace: appendTopic("+visitorid+") To conference id ("+confid+")");
    return new Promise((resolve, reject) => {
    Visitor.update(
    {
        "_id" :visitorid,
        "confs.confId": confid
    },
    {
        "$push": {
            "confs.$.mainTopic": topic
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

function setTopics(visitorid,confid, topic1) {
  console.log("Trace: setTopics("+visitorid+") To conference id ("+confid+")");
    var mainTopic=[];
    mainTopic.push(topic1);

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
        managerService.addTopic(visitorid,confid,topic1);
            resolve(true);
        }
    });
    });
}
function login(email, password){
    return new Promise((resolve, reject) => {
        Visitor.findOne({email: email},
            (err, user) => {
                if(err) {
                    reject({"error": err});
                    console.log('LOGIN STATUS: FAILED');
                }

                if(!user) {
                    console.log("info : wrong email");
                    return resolve({"info": " wrong email"});
                }
                if(!(user.password === password)) {
                    console.log("info : wrong password");
                    return resolve({"info": " wrong password"});
                }
                console.log('LOGIN STATUS: SUCCESS ' + user.email);
                resolve(user);
            });
    });
}

function getAllConfById(visitorId) {
    return new Promise((resolve, reject) => {
        this.getVisitorById(visitorId).then((vstr) => {
            console.log('confs: ' + vstr.confs);
            resolve(vstr.confs);
        })
    });
}

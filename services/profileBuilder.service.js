const mongoose  = require('mongoose'),
      ObjectId  = require('mongodb').ObjectID;
var Visitor     = require('../models/visitorSchema');
var ProfilePie     = require('../models/profile_pieSchema');
var qrcodeApi   = require('./qrcodeService')
var consts      = require('../consts.js');

var service = {};

//service.buildPie= buildPie;
service.createVisitor=createVisitor;
service.updateProfilePie=updateProfilePie;
service.updatePreffered_lectures=updatePreffered_lectures;
service.getPie=getPie;

module.exports = service;


function getPie(visitorid){
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
}

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
            //var newname = {first_name:first_name, last_name:last_name};
          var qr_code = qrcodeApi.createImage(linkdin, 'visitor')
          if (!qr_code){
              console.log("failed to create qr_code");
              reject("failed to create qr_code");
          }
          var newVisitor = new Visitor({
              name :{first_name:first_name,last_name:last_name},
              linkedin : linkdin,
              education : education,
              occupation : occupation,
              profile_pie:0,
              connection_percent:0.3,
              explore_percent:0.3,
              learn_percent:0.3,
              qr_code : qr_code
          });
          console.log('createVisitor STATUS: SUCCESS ' + first_name);
          newVisitor.save((err, visitor) => {
            if (err){
              console.log("error: " + err);
              reject("error");
            }
            else{
              console.log("new newVisitor: " + visitor);
              resolve(visitor);
            }
          })
        }
      })
  });
}

function updateProfilePie(visitorid, connection_percent,explore_percent,learn_percent) {
    var profilePie=connection_percent*0.001
    +explore_percent*0.01+learn_percent*0.1;
  console.log("Trace: updateProfilePie("+visitorid+")");
    return new Promise((resolve, reject) => {
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
    });
}

function updatePreffered_lectures
(visitorid, lecture1,lecture2,lecture3) {
  console.log("Trace: updatePreffered_lectures("+visitorid+")");
    var preffered_lectures=[];
    preffered_lectures.push(lecture1);
    preffered_lectures.push(lecture2);
    preffered_lectures.push(lecture3);
    
    return new Promise((resolve, reject) => {
          var conditions = {_id: ObjectId(visitorid)},
          update = {
                    'preffered_lectures':preffered_lectures
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
    });
}


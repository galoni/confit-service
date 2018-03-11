const mongoose  = require('mongoose'),
      ObjectId  = require('mongodb').ObjectID;
var Visitor     = require('../models/visitorSchema');
var ProfilePie     = require('../models/profile_pieSchema');
var qrcodeApi   = require('./qrcodeService')
var consts      = require('../consts.js');

var service = {};

service.buildPie= buildPie;
service.createVisitor=createVisitor;

module.exports = service;

function buildPie(findid, conferenceid){
    return new Promise((resolve, reject) => {
    console.log("visitor id: " + findid);
      Visitor.findOne({_id: ObjectId(findid)},
        (err, visitor) => {
          if(err) {
            console.log('BUILD PIE STATUS: FAILED');
            reject(err);
          }
        console.log('buildPie STATUS: SUCCESS');
          if(!visitor) {
            console.log("info : id was not found ");
            return resolve("error : wrong visitor id");
          }
        resolve(visitor);

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
          var qr_code = qrcodeApi.createImage(linkdin)
          if (!qr_code){
              console.log("failed to create qr_code");
              reject("failed to create qr_code");
          }
          var newVisitor = new Visitor({
              name :{first_name:first_name,last_name:last_name},
              linkedin : linkdin,
              education : education,
              occupation : occupation,
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

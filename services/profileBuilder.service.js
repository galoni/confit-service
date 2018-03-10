const mongoose  = require('mongoose'),
      ObjectId  = require('mongodb').ObjectID;
var Visitor     = require('../models/visitorSchema');
var ProfilePie     = require('../models/profile_pieSchema');
var consts      = require('../consts.js');

var service = {};

service.buildPie= buildPie;

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


                            
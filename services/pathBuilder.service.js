const mongoose  = require('mongoose'),
      ObjectId  = require('mongodb').ObjectID;
var Visitor     = require('../models/visitorSchema');
var ProfilePie     = require('../models/profile_pieSchema');
var confSession = require('../models/sessionSchema');
var lecture     = require('../models/lectureSchema');
var Conf        = require('../models/conferenceSchema');
var qrcodeApi   = require('./qrcodeService');
var consts      = require('../consts.js');
var variables   = require ('./variables');
var Path        = require ('./classes/path');
const util = require('util');
var service = {};

//service.buildPie= buildPie;
service.buildPath=buildPath;

module.exports = service;




function buildPath(){
  var path = new Path(variables);
  path.insertByPref(function (err, result){
    if (err){
      console.log("Could not build by preffered lectures:\n" + err);
      reject(err);
    }
    console.log("insertByPref: %j", result);
    });
  path.insertByTopic(function (err, result){
    if (err){
      console.log("Could not build by main topics:\n" + err);
      reject(err);
    }
    console.log("insertByTopic: %j", result);
    });
  return new Promise((resolve, reject) => {
    //console.log(variables);
    var conf = variables["conf"];
    var visitor = variables["visitor"];

    resolve (path);

  });
}


// Path Builder:
// The path builder gets an input of:
// program
// preferred lectures
// profile pie
// 	and produces a Path back to the user with relevant mode to be in.
// 	First, The Path builder turns the profile pie percentages into numbers.
// 	For every session picked alongside a mode, mode will decrease its value by 1.
// 	compute it by several steps:
// select preferred lectures as a path and select “Learn” mode
// lectures with the same main topic as the preferred lectures, select “Learn” if still left and “connect” if not.
// exhibits, select explore mode
// match the rest equally by modes (suggest to connect or explore)
// 	each compute will be alongside an elc mode suggestion.
// 	The program builder returns the new program as a Path object.
// The algorithm:
// Path:	//Path will let ELC show/change visitor the suggested mode and session
//
// session [] //list of lectures and their times
// elcmode [] //the suggest elc mode to be
// prefferedLectures prf
// program prog
// profilePie pie
// List sessions = prog.sessions
//
// 	exploresess = pie.explore * len(sessions)
// 	learnsess = pie.learn * len(sessions) - len(prf)
// 	connectsess = pie.connect* len(sessions)
// for index, session in sessions: //select preferred lectures as a path
// 	if session == some prf
// Path.session.append(Path.session)
// Path.elcmode.append(‘Learn’)
// 	if Path.session.time ==sessions.time
// 		remove parallel sessions from list //so parallel lectures won’t be suggested
// 	for session in sessions:
// 		if session.mainTopic == some prf.mainTopic and learnsess>0
// 			Path.session.append(Path.session)
// Path.elcmode.append(‘Learn’)
// 			remove parallel sessions from list
// 			learnsess--
// 		else if session.mainTopic == some prf.mainTopic and connectsess>0
// 			Path.session.append(Path.session)
// Path.elcmode.append(‘Connect’)
// 			remove parallel sessions from list
// 			connectsess--
// 		//after all important sessions were taken under consideration we will make sure he   //will be able to see exhibits if there are any and connect at the other time left
// 		if session.time is in prog.exhibit.time:
// 			rand(Path.session.append(Path.session)) //will choose a random lecture //and suggest to go explore exhibits if visitor wants to
// Path.elcmode.append(Explore)
// 			remove parallel sessions from list
// 			exploresess--
// 		for the rest:
// 			split until connectsess,learnsess,connectsess == 0
//

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

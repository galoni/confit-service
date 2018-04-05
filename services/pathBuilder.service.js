const mongoose = require('mongoose'),
  ObjectId = require('mongodb').ObjectID;
var Manager = require('./manager.service');
var Visitor = require('./profileBuilder.service');
var VisitorScehma = require('../models/visitorSchema');
var service = {};

service.buildPath = buildPath;

module.exports = service;

function addToVisitorSchema(build, visitorId, cb) {
  var doc = {
    custome_path: build
  }
  VisitorScehma.update({_id: visitorId}, doc, function(err, raw) {
    if (err){
      console.log(err);
       cb("Could not add Path to visitor " + visitorId);
    }
    else{
      console.log("Added custome path to "+ visitorId);
    }
  })
}

function insertByPref(build, program, profile, elc_modes, next) {
  profile["preffered_lectures"].forEach(function(pref, index1) {
    build.forEach(function(builda, index2) {
      builda["sessions"]["lectures"].forEach(function(lecture, index3) {
        //if the lecture is the preffered lecture, make it unique in the build (suggest this lecture)
        if (lecture["_id"] == pref) {
          builda["sessions"]["lectures"] = builda["sessions"]["lectures"].filter(function(lec) {
            return lec["_id"] == pref;
          })
          //attach an elc_mode by availability
          console.log("Found match for preffered lecture: " + pref);
          if (elc_modes["learn"] > 0) {
            builda["elc_mode"] = 'learn'
            elc_modes["learn"]--;
          } else if (elc_modes["connect"] > 0) {
            builda["elc_mode"] = 'connect'
            elc_modes["connect"]--;
          } else if (elc_modes["explore"] > 0) {
            builda["elc_mode"] = 'explore'
            elc_modes["explore"]--;
          }
        }
      });
    });
  });
  next(build, elc_modes, null);
}

function insertByTopic(build, program, profile, elc_modes, next) {
  profile["mainTopic"].forEach(function(maintopic, index1) {
    build.forEach(function(builda, index2) {
      builda["sessions"]["lectures"].forEach(function(lecture, index3) {
        if (lecture["topic"]) {
          lecture["topic"].forEach(function(topic, index4) {
            if (topic == maintopic) {
              builda["sessions"]["lectures"] = [lecture];
              console.log("Found match for main topics: " + lecture["_id"]);
              if (builda["elc_mode"] == undefined){
                if (elc_modes["learn"] > 0) {
                  builda["elc_mode"] = 'learn'
                  elc_modes["learn"]--;
                } else if (elc_modes["connect"] > 0) {
                  builda["elc_mode"] = 'connect'
                  elc_modes["connect"]--;
                } else if (elc_modes["explore"] > 0) {
                  builda["elc_mode"] = 'explore'
                  elc_modes["explore"]--;
                }
              }
            }
          });
        }
      });
    });
  });
  next(build, elc_modes, null);
}

function insertRest(build, program, profile, elc_modes, next) {
  build.forEach(function(abuild) {
    let lectures = abuild["sessions"]["lectures"]
    // console.log("\n\n\n\n" + lectures);
    if (lectures.length > 1) {
      abuild["sessions"]["lectures"] = [lectures[Math.floor(Math.random() * lectures.length)]];
      console.log("added left lecture: " + abuild["sessions"]["lectures"][0]["_id"]);
      if (elc_modes["learn"] > 0) {
        abuild["elc_mode"] = 'learn'
        elc_modes["learn"]--;
      } else if (elc_modes["connect"] > 0) {
        abuild["elc_mode"] = 'connect'
        elc_modes["connect"]--;
      } else if (elc_modes["explore"] > 0) {
        abuild["elc_mode"] = 'explore'
        elc_modes["explore"]--;
      }
    }
  });
  next(build, elc_modes, null);
}

function buildPath(confId,visitorId) {
  return new Promise((resolve, reject) => {
    console.log("------Building Path------");
    let _visitor = Visitor.getVisitorById(visitorId)
      .then(function(visitor_id) {
        let _program = Manager.getConfById(confId)
          .then(function(conf) {
            if (conf) {
              var program = conf["program"];
            } else {
              reject("no conf found");
            }
            if (visitor_id) {
              var visitor = visitor_id;
              var profile = visitor["confs"].find(function(element) {
                return element["confId"] == conf["_id"];
              });
              var elc_modes = {
                learn: profile["learn_percent"] * conf["program"].length,
                explore: profile["explore_percent"] * conf["program"].length,
                connect: profile["connection_percent"] * conf["program"].length,
              }
              console.log(profile);
            } else {
              reject("no visitor found");
            }
            var build = []
            program.forEach(function(element, index) {
              build.push({
                sessions: element,
                elc_mode: undefined
              })

            });
            console.log("before buildeing: " + elc_modes);
            insertByPref(build, program, profile, elc_modes, function(newBuild, newelc_modes, err) {
              build = newBuild;
              elc_modes = newelc_modes;
              console.log("after building by pref: %j", newelc_modes);
              var sum_modes = elc_modes["learn"] + elc_modes["connect"] + elc_modes["explore"]
              if (sum_modes > 0)
                insertByTopic(build, program, profile, elc_modes, function(newBuild, newelc_modes, err) {
                  console.log("after building by topic: %j", newelc_modes);
                  elc_modes = newelc_modes;
                  build = newBuild;
                  sum_modes = elc_modes["learn"] + elc_modes["connect"] + elc_modes["explore"]
                  if (sum_modes > 0)
                    insertRest(build, program, profile, elc_modes, function(newBuild, newelc_modes, err) {
                      elc_modes = newelc_modes;
                      console.log("after building by rest: %j", newelc_modes);
                      build = newBuild;
                      addToVisitorSchema(build, visitorId, function(err){
                        if (err) reject(err);
                      });
                      resolve(build);
                    });
                  else {
                    addToVisitorSchema(build, visitorId, function(err){
                      if (err) reject(err);
                    });
                    resolve(build);
                  }
                });
              else {
                addToVisitorSchema(build, visitorId, function(err){
                  if (err) reject(err);
                });
                resolve(build);
              }
            });



          })
          .catch(function(err) {
            console.log("error:" + err);
          });
      })
      .catch(function(err) {
        console.log("error:" + err);
      });

  })
};



// var path = new Path(variables);
// path.insertByPref(function (err, result){
//   if (err){
//     console.log("Could not build by preffered lectures:\n" + err);
//     reject(err);
//   }
//   console.log("insertByPref: %j", result);
//   });
// path.insertByTopic(function (err, result){
//   if (err){
//     console.log("Could not build by main topics:\n" + err);
//     reject(err);
//   }
//   console.log("insertByTopic: %j", result);
//   });






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

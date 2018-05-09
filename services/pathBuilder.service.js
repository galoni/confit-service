const mongoose = require('mongoose'),
  ObjectId = require('mongodb').ObjectID;
var Manager = require('./manager.service');
var Visitor = require('./profileBuilder.service');
var VisitorScehma = require('../models/visitorSchema');
var ConfSchema = require('../models/conferenceSchema');
var service = {};

service.buildPath = buildPath;

module.exports = service;

function removeFromVisitorSchema(visitorId, confId, cb) {
  let query = {
    "_id": visitorId,
    "confs.confId": confId
  }
  let doc = {
    "$unset": {
      "confs.$.custome_path": ""
    }
  }
  VisitorScehma.update(query, doc, function(err, raw) {
    if (err) {
      console.log(err);
      cb("Could not delete Path from visitor " + visitorId);
    } else {
      console.log("deleted old path from " + visitorId);
    }
  });
}

function addToVisitorSchema(build, visitorId, confId, cb) {
  var doc = {
    "$push": {
      "confs.$.custome_path": build
    }
  }
  let query = {
    "_id": visitorId,
    "confs.confId": confId
  }
  console.log(build);
  removeFromVisitorSchema(visitorId, confId);
  VisitorScehma.update(query, doc, function(err, raw) {
    if (err) {
      console.log(err);
      cb("Could not add Path to visitor " + visitorId);
    } else {
      console.log("Added custome path to " + visitorId);
    }
  })
}

function insertByPref(build, conf, profile, elc_modes, matched, next) {
  var pref_lec = conf.lectures.filter(function(e) {
    return profile["preffered_lectures"].indexOf(e._id) >= 0;
  });
  pref_lec.forEach(function(i) {
    build.session_list.forEach(function(sess, index) {
      if (i.session_id === sess.session.session_id) {
        let buffer = sess.session.lectures.filter(function(lec) {
          if (lec.topic == i.topic) {
            return 1
          }
        });
        if (buffer) {
          console.log("FOUND: " + buffer);
          build.session_list[index].session.lectures = buffer;
          matched += 1;
          // attach an elc_mode by availability
          if (elc_modes["learn"] > 0) {
            build.session_list[index].elc_mode = 'learn'
            elc_modes["learn"]--;
          } else if (elc_modes["connect"] > 0) {
            build.session_list[index].elc_mode = 'connect'
            elc_modes["connect"]--;
          } else if (elc_modes["explore"] > 0) {
            build.session_list[index].elc_mode = 'explore'
            elc_modes["explore"]--;
          }
        }
      }
    });
  });
  console.log("number of session matched: " + matched);
  next(build, elc_modes, matched, null);
}

function insertByTopic(build, conf, profile, elc_modes, matched, next) {
  profile.mainTopic.forEach(function(topic) {
    build.session_list.some(function(sess, index) {
      if (!sess.elc_mode) {
        console.log(sess.session_id);
        let buffer = sess.session.lectures.filter(function(lec) {
          return lec.topic == topic;
        });
        if (buffer) {
          console.log("found for " + topic);
          build.session_list[index].session.lectures = buffer;
          matched += 1;
          // attach an elc_mode by availability
          if (elc_modes["learn"] > 0) {
            build.session_list[index].elc_mode = 'learn'
            elc_modes["learn"]--;
          } else if (elc_modes["connect"] > 0) {
            build.session_list[index].elc_mode = 'connect'
            elc_modes["connect"]--;
          } else if (elc_modes["explore"] > 0) {
            build.session_list[index].elc_mode = 'explore'
            elc_modes["explore"]--;
          }
          return true;
        }
      }
    });
  });
  console.log("number of session matched: " + matched);
  next(build, elc_modes, matched, null);
}

function insertRest(build, program, profile, elc_modes,matched, next) {
  var selectedTopics = [];
  build.session_list.forEach(function(sess, index) {
    if (selectedTopics.indexOf(sess.session.lectures[0].topic) === -1 && sess.elc_mode)
      selectedTopics.push(sess.session.lectures[0].topic);
  });
  console.log(selectedTopics);
  selectedTopics.forEach(function(topic) {
    build.session_list.some(function(sess, index) {
      if (!sess.elc_mode) {
        let buffer = sess.session.lectures.filter(function(lec) {
          return lec.topic == topic;
        });
        if (buffer) {
          console.log("found for " + topic);
          build.session_list[index].session.lectures = buffer;
          matched += 1;
          // attach an elc_mode by availability
          if (elc_modes["learn"] > 0) {
            build.session_list[index].elc_mode = 'learn'
            elc_modes["learn"]--;
          } else if (elc_modes["connect"] > 0) {
            build.session_list[index].elc_mode = 'connect'
            elc_modes["connect"]--;
          } else if (elc_modes["explore"] > 0) {
            build.session_list[index].elc_mode = 'explore'
            elc_modes["explore"]--;
          }
          return true;
        }
      }
    });
  });
  console.log("number of session matched: " + matched);
  //taking care of the last that is not taking cared of
  build.session_list.some(function(sess, index) {
    if (!sess.elc_mode) {
      var randTopic = sess.session.lectures[Math.floor(Math.random() * sess.session.lectures.length)].topic;
      console.log("found random match: " + randTopic);
      let buffer = sess.session.lectures.filter(function(lec) {
        return lec.topic == randTopic;
      });
      if (buffer) {
        console.log("found for " + randTopic);
        build.session_list[index].session.lectures = buffer;
        // attach an elc_mode by availability
        if (elc_modes["learn"] > 0) {
          build.session_list[index].elc_mode = 'learn'
          elc_modes["learn"]--;
        } else if (elc_modes["connect"] > 0) {
          build.session_list[index].elc_mode = 'connect'
          elc_modes["connect"]--;
        } else if (elc_modes["explore"] > 0) {
          build.session_list[index].elc_mode = 'explore'
          elc_modes["explore"]--;
        }
        return true;
      }
    }
  });
  next(build, elc_modes, matched, null);
  //   var lecTopic = builda["sessions"]["lectures"][0]["topic"];
  //   console.log("this is the topic of index %s: %s", index, lecTopic);
  //   var fixed = builda["sessions"]["lectures"].every(function(lecture) {
  //     return lecture["topic"] === lecTopic;
  //   })
  //   if (!fixed) {
  //     let lectures = builda["sessions"]["lectures"];
  //     var randTopic = lectures[Math.floor(Math.random() * lectures.length)]["topic"];
  //     console.log("added the topic: " + randTopic);
  //     builda["sessions"]["lectures"] = builda["sessions"]["lectures"].filter(function(lec) {
  //       return lec["topic"] == randTopic;
  //     });
  //     if (elc_modes["learn"] > 0) {
  //       builda["elc_mode"] = 'learn'
  //       elc_modes["learn"]--;
  //     } else if (elc_modes["connect"] > 0) {
  //       builda["elc_mode"] = 'connect'
  //       elc_modes["connect"]--;
  //     } else if (elc_modes["explore"] > 0) {
  //       builda["elc_mode"] = 'explore'
  //       elc_modes["explore"]--;
  //     }
  //
  //   }
  // });
  // next(build, elc_modes, null);
}

function buildPath(confId, visitorId) {
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
                    console.log(profile);
                    console.log("learn: " + profile["learn_percent"]);
                    console.log("length: " + conf["program"].length);
                    var elc_modes = {
                      learn: profile["learn_percent"] * conf["program"].length,
                      explore: profile["explore_percent"] * conf["program"].length,
                      connect: profile["connection_percent"] * conf["program"].length,
                    }

                  } else {
                    reject("no visitor found");
                  }
                  var build = {
                    session_list: [],
                    match_percent: undefined
                  }
                  program.forEach(function(session, index) {
                    build.session_list.push({
                      session,
                      elc_mode: undefined
                    })
                  });
                  var matched = 0;
                  console.log("before building by pref: %j", elc_modes);
                  insertByPref(build, conf, profile, elc_modes, matched, function(newBuild, newelc_modes, newmatched, err) {
                      build = newBuild;
                      elc_modes = newelc_modes;
                      matched = newmatched;
                      console.log("after building by pref: %j", newelc_modes);
                      var sum_modes = elc_modes["learn"] + elc_modes["connect"] + elc_modes["explore"]
                      console.log("%j", build);
                      if (sum_modes > 0)
                        insertByTopic(build, program, profile, elc_modes, matched, function(newBuild, newelc_modes, newmatched, err) {
                          console.log("after building by topic: %j", newelc_modes);
                          elc_modes = newelc_modes;
                          build = newBuild;
                          matched = newmatched;
                          sum_modes = elc_modes["learn"] + elc_modes["connect"] + elc_modes["explore"]
                          if (sum_modes > 0)
                            insertRest(build, program, profile, elc_modes,matched, function(newBuild, newelc_modes,newmatched, err) {
                              elc_modes = newelc_modes;
                              console.log("after building by rest: %j", newelc_modes);
                              build = newBuild;
                              matched = newmatched;
                              build.match_percent = matched/build.session_list.length;
                              addToVisitorSchema(build, visitorId, confId, function(err) {
                                if (err) reject(err);
                              });
                              resolve(build);
                            });
                          else {
                            build.match_percent = matched/build.session_list.length;
                            addToVisitorSchema(build, visitorId, confId, function(err) {
                              if (err) reject(err);
                            });
                            resolve(build);
                          }
                        });
                      else {
                        build.match_percent = matched/build.session_list.length;
                        addToVisitorSchema(build, visitorId, confId, function(err) {
                          if (err) reject(err);
                        });
                        resolve(build);
                      }
                  })
              })
            })
          .catch(function(err) {
            console.log("error:" + err);
          });
        })
    .catch(function(err) {
      console.log("error:" + err);
    });

  }
  // function buildPath(confId, visitorId) {
  //   return new Promise((resolve, reject) => {
  //     console.log("------Building Path------");
  //     let _visitor = Visitor.getVisitorById(visitorId)
  //       .then(function(visitor_id) {
  //         let _program = Manager.getConfById(confId)
  //           .then(function(conf) {
  //             if (conf) {
  //               var program = conf["program"];
  //             } else {
  //               reject("no conf found");
  //             }
  //             if (visitor_id) {
  //               var visitor = visitor_id;
  //               var profile = visitor["confs"].find(function(element) {
  //                 return element["confId"] == conf["_id"];
  //               });
  //               console.log(profile);
  //               console.log("learn: " + profile["learn_percent"]);
  //               console.log("length: " + conf["program"].length);
  //               var elc_modes = {
  //                 learn: profile["learn_percent"] * conf["program"].length,
  //                 explore: profile["explore_percent"] * conf["program"].length,
  //                 connect: profile["connection_percent"] * conf["program"].length,
  //               }
  //
  //             } else {
  //               reject("no visitor found");
  //             }
  //             var build = []
  //             program.forEach(function(element, index) {
  //               build.push({
  //                 sessions: element,
  //                 elc_mode: undefined
  //               })
  //
  //             });
  //             console.log("before building by pref: %j", elc_modes);
  //             insertByPref(build, program, profile, elc_modes, function(newBuild, newelc_modes, err) {
  //               build = newBuild;
  //               elc_modes = newelc_modes;
  //               console.log("after building by pref: %j", newelc_modes);
  //               var sum_modes = elc_modes["learn"] + elc_modes["connect"] + elc_modes["explore"]
  //               if (sum_modes > 0)
  //                 insertByTopic(build, program, profile, elc_modes, function(newBuild, newelc_modes, err) {
  //                   console.log("after building by topic: %j", newelc_modes);
  //                   elc_modes = newelc_modes;
  //                   build = newBuild;
  //                   sum_modes = elc_modes["learn"] + elc_modes["connect"] + elc_modes["explore"]
  //                   if (sum_modes > 0)
  //                     insertRest(build, program, profile, elc_modes, function(newBuild, newelc_modes, err) {
  //                       elc_modes = newelc_modes;
  //                       console.log("after building by rest: %j", newelc_modes);
  //                       build = newBuild;
  //                       addToVisitorSchema(build, visitorId, confId, function(err) {
  //                         if (err) reject(err);
  //                       });
  //                       resolve(build);
  //                     });
  //                   else {
  //                     addToVisitorSchema(build, visitorId, confId, function(err) {
  //                       if (err) reject(err);
  //                     });
  //                     resolve(build);
  //                   }
  //                 });
  //               else {
  //                 addToVisitorSchema(build, visitorId, confId, function(err) {
  //                   if (err) reject(err);
  //                 });
  //                 resolve(build);
  //               }
  //             });
  //
  //
  //
  //           })
  //           .catch(function(err) {
  //             console.log("error:" + err);
  //           });
  //       })
  //       .catch(function(err) {
  //         console.log("error:" + err);
  //       });
  //
  //   })

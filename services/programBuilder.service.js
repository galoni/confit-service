const managerService = require('./manager.service');
const pathBuilder = require('./pathBuilder.service');
var uniqid = require('uniqid');

let service = {};

service.buildProgram = buildProgram;

module.exports = service;

function buildProgram(confId) {
  console.log('Trace: buildProgram ' + confId);
  return new Promise((resolve, reject) => {
    let conf = managerService.getConfById(confId).then((conf) => {
      let sortProgram = conf.program.sort(function(a, b) {
        return a.time - b.time
      });
      let sortLectures = conf.lectures.sort(function(a, b) {
        return b.ratings - a.ratings
      });
        // console.log('Trace: sortLectures ' + JSON.stringify(sortLectures));
      let topics = [];
      let topicsLectures = [];
      for (let tIndex = 0; tIndex < conf.main_topics.length; tIndex++){//split all sorted lectures by topic
          topics.push(conf.main_topics[tIndex]);
          topicsLectures[tIndex] = sortLectures.filter(lct => lct.topic === topics[tIndex]);
      }
      // console.log("topics: " + JSON.stringify(topics));
      // console.log("topicsLectures: " + JSON.stringify(topicsLectures));
      let spLength =  sortProgram.length;
      for (let sIndex = 0; sIndex < spLength; sIndex++){ //clear the lectures array
        sortProgram[sIndex].lectures = [];
        sortProgram[sIndex].session_id = uniqid();
      }
      for (let tIndex = 0; tIndex < topics.length; tIndex++) {//outer loop iterate over topic
          let lIndex = 0;
          for (let j = 0; j < tIndex; j++){//shift evey topic array
              topicsLectures[tIndex].push(topicsLectures[tIndex].shift());
          }
          // console.log("loop topicsLectures: " + JSON.stringify(topicsLectures[tIndex]));
          while (lIndex < topicsLectures[tIndex].length) {//loop of evey lecture
              for (let sIndex = 0; sIndex < spLength; sIndex++) {
                  // console.log('Trace: sortProgram ' + JSON.stringify(sortProgram[sIndex]));

                  if (topicsLectures[tIndex][lIndex] != null) {
                      // console.log('Trace: topicsLectures ' + JSON.stringify(topicsLectures[tIndex][lIndex]));
                      sortProgram[sIndex].lectures.push(topicsLectures[tIndex][lIndex]);
                      conf.lectures.some(function (lct, lctindex){
                        if (topicsLectures[tIndex][lIndex]._id === lct._id){
                          conf.lectures[lctindex].session_id = sortProgram[sIndex].session_id;
                          return true;
                        }
                      })
                  }
                  lIndex++;
                  if (lIndex === topicsLectures[tIndex].length) {
                      conf.program = sortProgram;
                      conf.save((err, cngObj) => {
                          if (err) {
                              reject({
                                  "error": err
                              });
                              console.log('update conf STATUS: FAILED' + err);
                          } else {
                              console.log(`update conf STATUS: SUCCESS`);
                              conf.visitors.forEach(function(visitorId) {
                                pathBuilder.buildPath(confId, visitorId);
                              });
                              sortProgram.sort(function (a, b) {
                                  return a.dayNum - b.dayNum
                              });
                              resolve(sortProgram);
                          }
                      });
                  }
              }
          }
      }
      console.log(`sorted finish: ${JSON.stringify(sortProgram)}`);
      conf.visitors.forEach(function(visitorId) {
          pathBuilder.buildPath(confId, visitorId.visitorid);
      });
      sortProgram.sort(function(a, b) {
          return a.dayNum - b.dayNum
      });
      resolve(sortProgram);
    });
  });
}
//========Matching Percent=======

// let totalMP = 0;
// let divide = conf.visitors.length;
// conf.visitors.forEach(function(visitorId) {
//     let errorCheck = 100;
//     // console.log("inside: visitorId " + JSON.stringify(visitorId));
//     // pathBuilder.buildPath(confId, visitorId);
//     sortProgram.forEach((sess)=>{
//         let sessCheck = 0;
//         // console.log("inside: sess " + JSON.stringify(sess));
//         sess.lectures.forEach((lct) => {
//             for(let i = 0; i < visitorId.preffered_lectures.length; i++){
//                 // console.log("inside: " + visitorId.preffered_lectures[i]);
//                 if (visitorId.preffered_lectures[i] === lct._id){
//                     // console.log("found");
//                     sessCheck++;
//                 }
//             }
//         });
//         console.log("sessCheck: " + sessCheck);
//         if (sessCheck === 2){
//             errorCheck = 50;
//         }
//         else if(sessCheck === 3){
//             errorCheck = 0;
//         }
//     });
//     totalMP += errorCheck;
//     console.log("totalMP: " + totalMP);
//     totalMP = 0;
// });
// console.log("MP: " + totalMP/divide);

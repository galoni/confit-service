const managerService = require('./manager.service');
const pathBuilder = require('./pathBuilder.service');

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
        console.log('Trace: sortLectures ' + JSON.stringify(sortLectures));
      let topics = [];
      let topicsLectures = [];
      for (let tIndex = 0; tIndex < conf.main_topics.length; tIndex++){//split all sorted lectures by topic
          topics.push(conf.main_topics[tIndex]);
          topicsLectures[tIndex] = sortLectures.filter(lct => lct.topic === topics[tIndex]);
      }
      // console.log("topics: " + JSON.stringify(topics));
      // console.log("topicsLectures: " + JSON.stringify(topicsLectures));
      for (let sIndex = 0; sIndex < sortProgram.length; sIndex++){ //clear the lectures array
        sortProgram[sIndex].lectures = [];
      }
      for (let tIndex = 0; tIndex < topics.length; tIndex++) {
          let lIndex = 0;
          // console.log("loop topicsLectures: " + JSON.stringify(topicsLectures[tIndex]));
          while (lIndex < topicsLectures[tIndex].length) {
              for (let sIndex = 0; sIndex < sortProgram.length; sIndex++) {
                  // console.log('Trace: sortProgram ' + JSON.stringify(sortProgram[sIndex]));
                  if (topicsLectures[tIndex][lIndex] != null) {
                      // console.log('Trace: topicsLectures ' + JSON.stringify(topicsLectures[tIndex][lIndex]));
                      sortProgram[sIndex].lectures.push(topicsLectures[tIndex][lIndex]);
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
                              // conf.visitors.forEach(function(visitorId) {
                              //   pathBuilder.buildPath(confId, visitorId);
                              // });
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
      // conf.visitors.forEach(function(visitorId) {
      //   pathBuilder.buildPath(confId, visitorId);
      // });
      sortProgram.sort(function(a, b) {
          return a.dayNum - b.dayNum
      });
      resolve(sortProgram);
    });
  });
}

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
      let lIndex = 0;
      while (lIndex < sortLectures.length) {
        for (let sIndex = 0; sIndex < sortProgram.length; sIndex++) {
          if (sortLectures[lIndex] != null) {
            sortProgram[sIndex].lectures.push(sortLectures[lIndex]);
          }
          lIndex++;
          if (lIndex === sortLectures.length) {
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
                resolve(cngObj);
              }
            });
          }
        }
      }
      console.log(`sorted program: ${JSON.stringify(sortProgram)}`);
      conf.visitors.forEach(function(visitorId) {
        pathBuilder.buildPath(confId, visitorId);
      });
      resolve(`sorted program: ${JSON.stringify(sortProgram)}`);
    });
  });
}

const express = require('express');
const router = express.Router();
const managerService = require('../services/manager.service');
const programBuilderService = require('../services/programBuilder.service');
// var session = require('express-session');
const Manager = require('../models/managerSchema');
const consts = require('../consts.js');

// routes
router.post('/createManager', createManager);
router.post('/createSession', createSession);
router.post('/getConfSessionByName', getConfSessionByName);
router.post('/getConfById', getConfById);
router.post('/addSessionToConf', addSessionToConf);
router.post('/createLecture', createLecture);
router.post('/addLectureToConf', addLectureToConf);
router.post('/createConference', createConference);
router.post('/removeSession', removeSession);
router.post('/removeLecture', removeLecture);
router.post('/buildProgram', buildProgram);
router.post('/getAllLectures', getAllLectures);
router.post('/addManyLectures', addManyLectures);
router.post('/createProgram', createProgram);
router.post('/getAllConfs', getAllConfs);
router.post('/getAllLecturesByTopic', getAllLecturesByTopic);
router.post('/getLectureById', getLectureById);
router.post('/getManagerById', getManagerById);
router.post('/getAllConfById', getAllConfById);
router.post('/removeConf', removeConf);

// router.post('/login', login);
// router.post('/register', register);
// router.get('/logout', logout);
// router.get('/getPrefById', checkSignIn, getPrefById);
// router.post('/getPrefById', getPrefById);
// router.post('/getPlaylistsById', getPlaylistsById);
// router.post('/setPref', setPref);
// router.post('/addTrackToPlaylist', addTrackToPlaylist);
// router.post('/addNewPlaylist', addNewPlaylist);
// router.post('/removePlaylist', removePlaylist);
// router.delete('/:_id', _delete);
// router.get('/login', function(req, res){
//    res.send('login page');
// });

module.exports = router;

function createManager(req, res) {
    managerService.createManager(req.body.first_name, req.body.last_name,req.body.linkdin,req.body.education,req.body.occupation)
        .then(function(status) {
            res.status(200).json({"status": status});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function createSession(req, res) {
  managerService.createSession(req.body.name, req.body.session_type, req.body.duration)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function createConference(req, res) {
    console.log(req);
  let name          = req.body.name;
  let type          = req.body.type;
  let logo          = req.body.logo;
  let start_date    = req.body.start_date;
  let duration      = req.body.duration;
  let location      = req.body.location;
  let audience      = req.body.audience;
  let main_topics   = req.body.main_topics;
  let managerId     = req.body.managerId;
  console.log("data: " +main_topics);
  managerService.createConference(name, type, logo, start_date, duration, location, audience, main_topics, managerId)
      .then(function(status) {
          res.status(200).json(status);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function createLecture(req, res) {
  let name          = req.body.name;
  let lecturer_name = req.body.lecturer_name;
  let topic      = req.body.topic;
  let description   = req.body.description;
  let ratings       = req.body.ratings;

  managerService.createLecture(name, lecturer_name, description, topic, ratings)
      .then(function(status) {
          res.status(200).json(status);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function getConfSessionByName(req, res){
    managerService.getConfSessionByName(req.body.name)
        .then(function (session_type) {
            if (session_type) {
                console.log("session_type:" + session_type);
                res.send(session_type);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}

function removeSession(req, res) {
  let confId      = req.body.confId;
  let sessionName = req.body.sessionName;
  managerService.removeSession(confId, sessionName)
    .then(function(status) {
        res.status(200).json({"status": status});
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function removeLecture(req, res) {
    let confId      = req.body.confId;
    let lectureName = req.body.lectureName;
    managerService.removeLecture(confId, lectureName)
        .then(function(status) {
            res.status(200).json({"status": status});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getConfById(req, res){
    managerService.getConfById(req.body.confId)
        .then(function (conf) {
            if (conf) {
                console.log("confernce:" + conf);
                res.send(conf);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}

function getManagerById(req, res){
    managerService.getManagerById(req.body.managerId)
        .then(function (manager) {
            if (manager) {
                console.log("manager:" + manager);
                res.send(manager);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}

function getAllConfById(req, res){
    managerService.getAllConfById(req.body.managerId)
        .then(function (confs) {
            if (confs) {
                console.log("done");
                // console.log("confs:" + confs);
                res.send(confs);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}

function getLectureById(req, res){
    managerService.getLectureById(req.body.lectureId)
        .then(function (lect) {
            if (lect) {
                console.log("lecture:" + lect);
                res.send(lect);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}

function addSessionToConf(req, res) {
  let name         = req.body.name;
  let session_type = req.body.session_type;
  let duration     = req.body.duration;
  let confId     = req.body.confId;
  let dayNum     = req.body.dayNum;
  let time     = req.body.time;
    managerService.addSessionToConf(name, session_type, duration, dayNum, time, confId)
    .then(function(status) {
        res.status(200).json({"status": status});
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function addLectureToConf(req, res) {
  let lectureId   = req.body.lectureId;
  let confId     = req.body.confId;
  managerService.addLectureToConf(lectureId, confId)
    .then(function(status) {
        res.status(200).json({"status": status});
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function buildProgram(req, res) {
    let confId     = req.body.confId;
    programBuilderService.buildProgram(confId)
        .then(function(status) {
            res.status(200).json(status);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllLectures(req, res){
    managerService.getAllLectures()
        .then(function (lectures) {
            if (lectures) {
                console.log("lectures:" + lectures);
                res.send(lectures);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}

function getAllLecturesByTopic(req, res){
    let topics   = req.body.main_topics;
    managerService.getAllLecturesByTopic(topics)
        .then(function (lectures) {
            if (lectures) {
                console.log("lectures:" + lectures);
                res.send(lectures);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}

function getAllConfs(req, res){
    managerService.getAllConfs()
        .then(function (confs) {
            if (confs) {
                console.log("confs:" + confs);
                res.send(confs);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}

function addManyLectures(req, res){
    let confLectures   = req.body.confLectures;
    let confId     = req.body.confId;
    let confTopics     = req.body.confTopics;
    managerService.addManyLectures(confLectures, confId, confTopics)
        .then(function(status) {
            res.status(200).json(status);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function createProgram(req, res){
    let confSessions   = req.body.confSessions;
    let confId     = req.body.confId;
    managerService.createProgram(confSessions, confId)
        .then(function(status) {
            res.status(200).json(status);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function removeConf(req, res) {
  let confId      = req.body.confId;
  let managerId = req.body.managerId;
  managerService.removeConf(confId, managerId)
    .then(function(status) {
        res.status(200).json(status);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function login(req, res) {
    userService.login(req.body.username, req.body.password)
        .then(function (user) {
            if (user) {
              res.send(user);
            } else {
                // authentication failed
                res.status(401).send('Username or password is f incorrect');
            }
        })
        .catch(function (err) {
            console.log("login error:" + err);
            res.status(400).send(err);
        });
}

function register(req, res) {
    userService.create(req.body.username, req.body.password)
        .then(function () {
            login(req, res);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function checkSignIn(req, res, next){
   if (!req.session.user ) {
    console.log("checkSignIn.: NOT");
    res.redirect('/');
  } else {
    next();
  }
}

function logout(req, res){
   req.session.destroy(function(){
        sess=null;
      console.log("user logged out.");
   });
   res.redirect('/users/login');
}

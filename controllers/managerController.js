const express = require('express');
const router = express.Router();
const managerService = require('../services/manager.service');
const programBuilderService = require('../services/programBuilder.service');
// var session = require('express-session');
const Manager = require('../models/managerSchema');
const consts = require('../consts.js');

// routes
// router.post('/createConference', createConference);
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
  let end_date      = req.body.end_date;
  let location      = req.body.location;
  let audience      = req.body.audience;
  managerService.createConference(name, type, logo, start_date, end_date, location, audience)
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
  let duration      = req.body.duration;
  let description   = req.body.description;
  let ratings       = req.body.ratings;
  managerService.createLecture(name, lecturer_name, description, duration, ratings)
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
    managerService.getConfById(req.body.id)
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
            res.status(200).json({"status": status});
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

function getPrefById(req, res) {
    userService.getPrefById(req.body.id)
        .then(function (pref) {
            if (pref) {
                res.send(pref);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function setPref(req, res) {
    userService.setPref(req.body.id, req.body.update)
        .then(function (pref) {
          res.send(pref);
        })
        .catch(function (err) {
          console.log("setPref error:" + err);
          res.status(400).send(err);
        });
}

function _delete(req, res) {
    userService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
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

function addTrackToPlaylist(req, res) {
  let trackId     = req.body.trackId;
  let userId      = req.body.userId;
  let playlistName = req.body.playlistName;
  userService.addTrackToPlaylist(trackId, userId, playlistName)
    .then(function(status) {
        res.status(200).json({"status": status});
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function addNewPlaylist(req, res) {
  let userId      = req.body.userId;
  let playlistName = req.body.playlistName;
  userService.addNewPlaylist(userId, playlistName)
    .then(function(status) {
        res.status(200).json({"status": status});
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function removeTrackFromPlaylist(req, res) {
  let trackId     = req.body.trackId;
  let userId      = req.body.userId;
  let playlistName = req.body.playlistName;
  userService.removeTrackFromPlaylist(trackId, userId, playlistName)
    .then(function(status) {
        res.status(200).json({"status": status});
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function removePlaylist(req, res) {
  let userId      = req.body.userId;
  let playlistName = req.body.playlistName;
  userService.removePlaylist(userId, playlistName)
    .then(function(status) {
        res.status(200).json({"status": status});
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function getPlaylistsById(req, res){
    userService.getPlaylistsById(req.body.id)
        .then(function (playlists) {
            if (playlists) {
                console.log("playlists:" + playlists);
                res.send(playlists);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
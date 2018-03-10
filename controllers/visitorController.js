var express = require('express');
var router = express.Router();
var visitorService = require('../services/profileBuilder.service');
var Visitor = require('../models/visitorSchema');
var consts = require('../consts.js');

router.post('/buildPie', buildPie);

module.exports = router;


function buildPie(req, res) {
  visitorService.buildPie(req.body.visitorid, req.body.conferenceid)
      .then(function(status) {
          res.status(200).json({"status": status});
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
var express = require('express');
var router = express.Router();
var visitorService = require('../services/profileBuilder.service');
var pathBuilderService = require('../services/pathBuilder.service');
var Visitor = require('../models/visitorSchema');
var consts = require('../consts.js');

//router.post('/buildPie', buildPie);
router.post('/matching', matching);
router.post('/registerToConf', registerToConf);
router.post('/createVisitor', createVisitor);
//router.post('/updateProfilePie', updateProfilePie);
router.post('/updatePreffered_lectures', updatePreffered_lectures);
router.post('/appendPrefferedLecture', appendPrefferedLecture);
router.post('/getConfsVisitor', getConfsVisitor);
router.post('/buildPath', buildPath);
router.post('/getVisitorById', getVisitorById);
router.post('/setTopics', setTopics);
router.post('/appendTopic', appendTopic);
router.post('/updatePercent', updatePercent);
router.post('/matching', matching);
router.post('/login', login);
router.post('/getAllConfById', getAllConfById);

module.exports = router;




function getVisitorById(req, res){
    visitorService.getVisitorById(req.body.id)
        .then(function (visitor) {
            if (visitor) {
                console.log("visitor:" + visitor);
                res.send(visitor);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}


function matching(req, res){
    visitorService.matchingPeople(req.body.visitorid, req.body.confid)
        .then(function (visitors) {
            if (visitors) {
                console.log("visitors:" + visitors);
                res.send(visitors);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}


function createVisitor(req, res) {
  visitorService.createVisitor(req.body.email, req.body.password, req.body.firstName, req.body.lastName,req.body.linkedin,req.body.education,req.body.occupation)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function updatePercent(req, res) {
  visitorService.updatePercent(req.body.visitorid, req.body.confid,req.body.connection_precent,req.body.learn_precent,req.body.explore_precent)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function registerToConf(req, res) {
  visitorService.registerToConf(req.body.visitorid, req.body.confid, req.body.confname, req.body.logo)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}


/*function updateProfilePie(req, res) {
  visitorService.updateProfilePie(req.body.visitorid, req.body.connection_percent,req.body.explore_percent,req.body.learn_percent)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}*/

function appendTopic(req, res) {
  visitorService.appendTopic(req.body.visitorid, req.body.confid,req.body.topic)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function setTopics(req, res) {
  visitorService.setTopics(req.body.visitorid, req.body.confid,req.body.topic1)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function getConfsVisitor(req, res) {
  visitorService.getConfsVisitor(req.body.visitorid)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function appendPrefferedLecture(req, res) {
  visitorService.appendPrefferedLecture(req.body.visitorid,req.body.confid,req.body.lecture)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function updatePreffered_lectures(req, res) {
  visitorService.updatePreffered_lectures(req.body.visitorid,req.body.confid,req.body.lecture1,req.body.lecture2,req.body.lecture3)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function buildPath(req, res) {
  pathBuilderService.buildPath(req.body.confId,req.body.visitorId)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function login(req, res) {
    visitorService.login(req.body.email, req.body.password)
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
function getAllConfById(req, res) {
    visitorService.getAllConfById(req.body.visitorId)
        .then(function(confs) {
            if (confs) {
                console.log("done");
                // console.log("confs:" + confs);
                res.send(confs);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            console.log("error:" + err);
            res.status(400).send(err);
        });
}
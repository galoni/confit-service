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
    visitorService.matching(req.body.visitorid, req.body.conferenceid)
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
  visitorService.createVisitor(req.body.first_name, req.body.last_name,req.body.linkdin,req.body.education,req.body.occupation)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function registerToConf(req, res) {
  visitorService.registerToConf(req.body.visitorid, req.body.confid,req.body.confname,req.body.connection_precent,req.body.learn_precent,req.body.explore_precent)
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
  visitorService.setTopics(req.body.visitorid, req.body.confid,req.body.topic1,req.body.topic2,req.body.topic3)
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

var express = require('express');
var router = express.Router();
var visitorService = require('../services/profileBuilder.service');
var Visitor = require('../models/visitorSchema');
var consts = require('../consts.js');

//router.post('/buildPie', buildPie);
router.post('/createVisitor', createVisitor);
router.post('/updateProfilePie', updateProfilePie);
router.post('/updatePreffered_lectures', updatePreffered_lectures);

module.exports = router;


/*function buildPie(req, res) {
  visitorService.buildPie(req.body.visitorid, req.body.conferenceid)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}*/


function createVisitor(req, res) {
  visitorService.createVisitor(req.body.first_name, req.body.last_name,req.body.linkdin,req.body.education,req.body.occupation)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}


function updateProfilePie(req, res) {
  visitorService.updateProfilePie(req.body.visitorid, req.body.connection_percent,req.body.explore_percent,req.body.learn_percent)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function updatePreffered_lectures(req, res) {
  visitorService.updatePreffered_lectures(req.body.visitorid, req.body.lecture1,req.body.lecture2,req.body.lecture3)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}
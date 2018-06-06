var express = require('express');
var router = express.Router();
var push_notificationService = require('../services/fcm.service');
var push_notificationSchema = require('../models/push_notificationSchema');


router.post('/getMessagesByTopic', getMessagesByTopic);

module.exports = router;




function getMessagesByTopic(req, res) {
  req.body.topic = req.body.topic.replace(/[^a-z0-9]/gi, '');
  push_notificationService.getMessagesByTopic(req.body.topic)
    .then(function(push_notification) {
      if (push_notification) {
        console.log("push_notification:" + push_notification);
        res.send(push_notification);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(function(err) {
      console.log("error:" + err);
      res.status(400).send(err);
    });
}

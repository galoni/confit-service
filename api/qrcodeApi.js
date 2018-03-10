var express = require('express');
var router = express.Router();
var qrcodeService = require('../services/qrcodeService');
var consts = require('../consts.js');

router.post('/create_image_qrcode', create_image_qrcode);
router.post('/create_string_qrcode', create_string_qrcode)
module.exports = router;


function create_string_qrcode(req, res) {
  qrcodeService.createStringQRCode(req.body.linkedin)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function create_image_qrcode(req, res) {
  qrcodeService.createFileQRCode(req.body.linkedin)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

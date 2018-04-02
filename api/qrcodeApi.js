var express = require('express');
var router = express.Router();
var qrcodeService = require('../services/qrcodeService');
var consts = require('../consts.js');

router.post('/create_image_qrcode', create_image_qrcode);
router.post('/create_string_qrcode', create_string_qrcode);
router.post('/delete_image_qrcode', delete_image_qrcode);
router.post('/get_image_qrcode', get_image_qrcode);
module.exports = router;

//create a QR Code String and returns qr code as string
function create_string_qrcode(req, res) {
  qrcodeService.createStringQRCode(req.body.linkedin)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

//create a QR Code image and returns filename
function create_image_qrcode(req, res) {
  qrcodeService.createImage(req.body.linkedin, req.body.type)
      .then(function(status) {
          res.status(200).json({"status": status});
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}
//delete a QR Code image and returns true or false
function delete_image_qrcode(req, res) {
  qrcodeService.deleteImage(req.body.qrcode)
    .then(function(status) {
        res.status(200).json({"file deleted": status});
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}
//delete a QR Code image and returns true or false
function get_image_qrcode(req, res) {
  qrcodeService.getImage(req.body.qrcode, function(status){
    console.log("Yellow");
    if (status){
      res.status(200).sendFile(status, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          console.log('Sent:', status);
        }
      });
    }
    else{
      res.status(400).json({"errmsg": "could not find image"});
    }
  });
}

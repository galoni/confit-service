var express = require('express');
var router = express.Router();
var qrcodeService = require('../services/qrcodeService');
var consts = require('../consts.js');
var AWS = require('aws-sdk');
var credentials = new AWS.SharedIniFileCredentials({profile: 'confit'});
AWS.config.credentials = credentials;
var s3 = new AWS.S3();
var fs = require('fs')
var join = require('path').join
var s3Zip = require('s3-zip')

var config = {
  accessKeyId: "AKIAJB2PN4H56GCR34JA",
  secretAccessKey: "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",
  region: "eu-central-1",
  bucket: consts.AWS_QRCODE_BUCKET
};

router.post('/create_image_qrcode', create_image_qrcode);
router.post('/create_string_qrcode', create_string_qrcode);
router.post('/delete_image_qrcode', delete_image_qrcode);
router.get('/get_image_qrcode', get_image_qrcode);
router.post('/get_multiple_images', get_multiple_images);
module.exports = router;

//create a QR Code String and returns qr code as string
function create_string_qrcode(req, res) {
  qrcodeService.createStringQRCode(req.body.linkedin)
    .then(function(status) {
      res.status(200).json({
        "status": status
      });
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
}

//create a QR Code image and returns filename
function create_image_qrcode(req, res) {
  qrcodeService.createImagePromise(req.body.id, req.body.data, req.body.type)
    .then(function(status) {
      res.status(200).json({
        "status": status
      });
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
}
//delete a QR Code image and returns true or false
function delete_image_qrcode(req, res) {
  qrcodeService.deleteImage(req.body.qrcode)
    .then(function(status) {
      res.status(200).json({
        "file deleted": status
      });
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
}
//delete a QR Code image and returns true or false
function get_image_qrcode(req, res) {
  if (!req.query['fileKey']) {
    res.status(404).send('no fileKey');
    return
  }
  var fileKey = req.query['fileKey'];
  console.log('Trying to download file', fileKey);

  var options = {
    Bucket: consts.AWS_QRCODE_BUCKET,
    Key: fileKey,
  };
  var fileStream = s3.getObject(options, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        res.status(404).send('bad fileKey');
      } else console.log(data);
    })
    .createReadStream();
  res.attachment(fileKey);
  fileStream.pipe(res);
}

function get_multiple_images(req, res) {
  qrcodeService.get_multiple_images(req.body.confId)
    .then(function(status) {
      res.status(200).json({
        "zip uploaded": status
      });
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
}

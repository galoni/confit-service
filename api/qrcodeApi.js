var express = require('express');
var router = express.Router();
var qrcodeService = require('../services/qrcodeService');
var consts = require('../consts.js');
var AWS = require('aws-sdk');

router.post('/create_image_qrcode', create_image_qrcode);
router.post('/create_string_qrcode', create_string_qrcode);
router.post('/delete_image_qrcode', delete_image_qrcode);
router.get('/get_image_qrcode', get_image_qrcode);
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
  qrcodeService.createImagePromise(req.body.id, req.body.data, req.body.type)
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
  var fileKey = req.query['fileKey'];

    console.log('Trying to download file', fileKey);
    AWS.config.update(consts.AWS_KEYS);
    var s3 = new AWS.S3();
    var options = {
        Bucket    : consts.AWS_QRCODE_BUCKET,
        Key    : fileKey,
    };

    res.attachment(fileKey);
    var fileStream = s3.getObject(options).createReadStream();
    fileStream.pipe(res);
  // qrcodeService.getImage(req.body.qrcode, function(status){
  //   console.log("Yellow");
  //   if (status){
  //     res.status(200).sendFile(status, function (err) {
  //       if (err) {
  //         res.status(400).send(err);
  //       } else {
  //         console.log('Sent:', status);
  //       }
  //     });
  //   }
  //   else{
  //     res.status(400).json({"errmsg": "could not find image"});
  //   }
  // });
}

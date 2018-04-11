var QRCode = require('qrcode')
var uuid = require('node-uuid');
const fs = require('fs');
const consts = require('../consts');
var AWS = require('aws-sdk');
AWS.config.update(consts.AWS_KEYS);
var s3 = new AWS.S3();


var service = {};

service.createStringQRCode = createStringQRCode;
service.createImage = createImage;
service.deleteImage = deleteImage;
service.getImage = getImage;
service.createImagePromise = createImagePromise;
module.exports = service;

function createStringQRCode(linkedin) {
  return new Promise((resolve, reject) => {
    console.log("QR Code content: " + linkedin);
    var qr = QRCode.toString(linkedin, function(err, string) {
      if (err) throw err
      console.log(string)
      return string
    })
    resolve(qr);

  });
};

function createImagePromise(id, data, type) {
  return new Promise((resolve, reject) => {
  createImage(id, data, type, function(answer, err){
    if (answer) {
      resolve(answer);
    } else {
      reject(err);
    }
  });
});
}

function uploadToS3(keyName, file, cb) {

  fs.readFile(file, function (err,img) {
  if (err) {
    return console.log(err);
  }
  let stats = fs.statSync(file);
  console.log("file size: " + stats.size);
  var params = {
    Bucket: consts.AWS_QRCODE_BUCKET,
    Key: keyName,
    Body: img,
    ACL:'public-read'
  };
  s3.putObject(params, function(err, file) {
    if (err) {
      console.log(err);
      cb (null);
    } else {
      console.log("Successfully uploaded image to " + consts.AWS_QRCODE_BUCKET + "/" + keyName);
      cb (keyName);
    }
  });
});

}

function createImage(id, data, type, cb) {
  console.log("creating qr code image with the content:\ntype: " + type + "\ndata: " + data + "\nid: " + id);
  if (!data || !type || !id) {
    console.log("not enough arguments passed");
    cb(null, "not enough arguments passed");
  }
  // Generate a v4 (random) UUID
  var filename = type + '-' + uuid.v4() + '.png';
  var qrjson = {
    type: type,
    data: data,
    id: id
  }
  // filename -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
  QRCode.toFile(consts.QRCODELIB + filename, JSON.stringify(qrjson), {
    color: {
      dark: '#02729a', // Blue dots
      light: '#FFFF' // Transparent background
    }
  }, function(err) {
    if (err) throw err
    uploadToS3(filename, consts.QRCODELIB + filename, function(uploaded){
      if (uploaded != null) {
        var urlParams = {
          Bucket: consts.AWS_QRCODE_BUCKET,
          Key: uploaded
        };
        s3.getSignedUrl('getObject', urlParams, function(err, url) {
          console.log('the url of the image is ', url);
        })
        deleteImage(uploaded);
        cb (uploaded, null);
      }
      else{
        console.log("could not upload to AWS");
        cb(null, "could not upload to AWS")
      }
    });
  });

};
//Deleting a QR image
function deleteImage(filename) {
  console.log("filename: " + filename);
  fs.unlink(consts.QRCODELIB + filename, (err) => {
    if (err) {
      throw err;
    }
    console.log(filename + ' was deleted');
    return true
  });
};

//get a QR image
function getImage(fileKey, cb) {
  var fileKey;
    console.log('Trying to download file', fileKey);
    var options = {
        Bucket    : consts.AWS_QRCODE_BUCKET,
        Key    : fileKey,
    };

    res.attachment(fileKey);
    var fileStream = s3.getObject(options).createReadStream();
    fileStream.pipe(res);
};

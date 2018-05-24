var QRCode = require('qrcode');
var uuid = require('node-uuid');
const fs = require('fs');
const consts = require('../consts');
var AWS = require('aws-sdk');
const mongoose = require('mongoose'),
  ObjectId = require('mongodb').ObjectID;
var Visitor = require('../models/visitorSchema');
var Conf = require('../models/conferenceSchema');
var s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET
});
var join = require('path').join;
var s3Zip = require('s3-zip');

var config = {
  bucket: consts.AWS_QRCODE_BUCKET
};


var service = {};

service.uploadImagePromise = uploadImagePromise;
service.uploadLogoToS3 = uploadLogoToS3;
service.get_multiple_images = get_multiple_images;

module.exports = service;


function uploadImagePromise(data, id,type) {
  return new Promise((resolve, reject) => {
    console.log("this is the data" + data);
    uploadImage(data, id,type,  function(answer, err) {
      if (answer) {
        resolve(answer);
      } else {
        reject(err);
      }
    });
  });
}

function uploadLogoToS3(keyName, file, cb) {
  console.log(keyName);
  console.log(file.buffer);
  var params = {
    Bucket: consts.AWS_LOGO_BUCKET,
    Key: keyName,
    Body: file.buffer,
    ACL: 'public-read'
  };
  s3.putObject(params, function(err, file) {
    if (err) {
      console.log(err);
      cb(null);
    } else {
      console.log("Successfully uploaded image to " + consts.AWS_LOGO_BUCKET + "/" + keyName);
      cb(keyName);
    }
  });

}

function updateConfImage(id, filename) {
  Conf.findOne({
      _id: ObjectId(id)
    },
    (err, conf) => {
      if (err) {
        console.log("error: " + err);
        reject("error");
      }
      if (conf) {
        console.log("info : exist linkdin profile");
        doc = {
          logo: filename
        };
        Conf.update({
          _id: conf["_id"]
        }, doc, function(err, raw) {
          if (err) {
            reject("could not update qr_code")
          } else {
            console.log("Added logo to " + conf["_id"]);
          }
        });

      }
    });
}

function uploadImage(data, id,type, cb) {
  if (!data || !id ||!type) {
    console.log("not enough arguments passed");
    cb(null, "not enough arguments passed");
  }
  // Generate a v4 (random) UUID
  var filename = uuid.v4() + '.png';
  if (type == 'logo'){
    uploadLogoToS3(filename, data, function(uploaded) {
      if (uploaded != null) {
        updateConfImage(id, filename);
        cb(uploaded, null);
      } else {
        console.log("could not upload to AWS");
        cb(null, "could not upload to AWS")
      }
    });
  }
  else if (type == 'profilePic'){
    uploadprofilePicToS3(filename, data, function(uploaded) {
      if (uploaded != null) {
        updateVisitorImage(id, filename);
        cb(uploaded, null);
      } else {
        console.log("could not upload to AWS");
        cb(null, "could not upload to AWS")
      }
    });
  }
  else{
    console.log("did not match type");
  }
};

//get a QR image
function getImage(fileKey, cb) {
  var fileKey;
  console.log('Trying to download file', fileKey);
  var options = {
    Bucket: consts.AWS_QRCODE_BUCKET,
    Key: fileKey,
  };

  res.attachment(fileKey);
  var fileStream = s3.getObject(options).createReadStream();
  fileStream.pipe(res);
};

//zip conference
function get_multiple_images(confId) {
  console.log(confId);
  var Manager = require('./manager.service');
  return new Promise((resolve, reject) => {
    let _program = Manager.getConfById(confId)
      .then((conf) => {
        if (conf) {
          console.log("searching for " + conf.name + '.zip');
          var params = {
            Bucket: consts.AWS_QRCODE_BUCKET,
            Key: conf.name + '.zip'
          };
          s3.headObject(params, function(err, metadata) {
            if (err && err.code === 'NotFound') {
              // Handle no object on cloud here
              console.log("conf does not exist in S3, will create: " + conf);
              var region = consts.AWS_REGION;
              var bucket = consts.AWS_QRCODE_BUCKET;
              var folder = '.';
              var output = fs.createWriteStream(join(consts.QRCODELIB, conf.name + '.zip'));
              var files = [];
              files.push(conf.qr_code);
              conf.lectures.forEach(function(lct) {
                files.push(lct.qr_code);
              });
              console.log(files);
              s3Zip
                .archive({
                  region: region,
                  bucket: bucket
                }, null, files)
                .pipe(output)
                .on('finish', function() {
                  console.log("Created zip");
                  uploadToS3(conf.name + '.zip', consts.QRCODELIB + conf.name + '.zip', function(uploaded) {
                    if (uploaded != null) {
                      deleteImage(uploaded);
                      resolve(uploaded.replace(" ", "%20"));
                    } else {
                      console.log("could not upload to AWS");
                      reject("could not upload to AWS");
                    }
                  });
                });
            } else {
              resolve(params.Key.replace(" ", "%20"));
            }
          });
        } else {
          console.log("did not find conf");
          reject("did not find conf");
        }

      });
  });
};


function uploadprofilePicToS3(keyName, file, cb) {
  console.log(keyName);
  console.log(file.buffer);
  var params = {
    Bucket: consts.AWS_USER_PROFILE_BUCKET,
    Key: keyName,
    Body: file.buffer,
    ACL: 'public-read'
  };
  s3.putObject(params, function(err, file) {
    if (err) {
      console.log(err);
      cb(null);
    } else {
      console.log("Successfully uploaded image to " + consts.AWS_USER_PROFILE_BUCKET + "/" + keyName);
      cb(keyName);
    }
  });

}

function updateVisitorImage(id, filename) {
  Visitor.findOne({
      _id: ObjectId(id)
    },
    (err, visitor) => {
      if (err) {
        console.log("error: " + err);
        reject("error");
      }
      if (visitor) {
        doc = {
          profilePic: filename
        };
        Visitor.update({
          _id: visitor["_id"]
        }, doc, function(err, raw) {
          if (err) {
            reject("could not update qr_code")
          } else {
            console.log("Added profile picture to " + visitor["_id"]);
          }
        });

      }
    });
}

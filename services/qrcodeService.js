var QRCode = require('qrcode')
var uuid = require('node-uuid');
const fs = require('fs');
const consts = require('../consts');


var service = {};

service.createStringQRCode= createStringQRCode;
service.createImage = createImage;
service.deleteImage = deleteImage;
service.getImage = getImage;
module.exports = service;

function createStringQRCode(linkedin){
    return new Promise((resolve, reject) => {
      console.log("QR Code content: " + linkedin);
      var qr = QRCode.toString(linkedin, function (err, string) {
        if (err) throw err
        console.log(string)
        return string
      })
      resolve(qr);

    });
  };

function createImage(data, type){
    console.log("creating qr code image with the content:\ntype: " + type + "\ndata: " + data);
    if (!data || !type){
      console.log("not enough arguments passed");
      return null
    }
    // Generate a v4 (random) UUID
    var filename = uuid.v4() + '.png';
    var qrjson = {
      type: type,
      data: data
    }
    // filename -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
    var qr = QRCode.toFile(consts.QRCODELIB + filename, JSON.stringify(qrjson), {
      color: {
        dark: '#02729a',  // Blue dots
        light: '#0000' // Transparent background
      }
    }, function (err) {
      if (err) throw err
      return null
    })
    console.log('created file for qr code')
    return filename
};
//Deleting a QR image
function deleteImage(filename){
    console.log("filename: " + filename);
    fs.unlink(filename, (err) => {
      if (err) {
        return false
        throw err;
      }
      console.log(filename + ' was deleted');
      return true
    });
};

//get a QR image
function getImage(filename, cb){
    console.log("filename: " + filename);
    var img = fs.readFileSync(consts.QRCODELIB + filename);
    if (!img){
      console.log("filename not exist");
      return null
    }
     return cb(img);

};

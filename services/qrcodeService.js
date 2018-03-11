var QRCode = require('qrcode')
var uuid = require('node-uuid');
const fs = require('fs');
const consts = require('../consts');


var service = {};

service.createStringQRCode= createStringQRCode;
service.createImage = createImage;
service.deleteImage = deleteImage;
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

function createImage(linkedin){
    console.log("linkedin: " + linkedin);
    // Generate a v4 (random) UUID
    var filename = uuid.v4() + '.png';
    // filename -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
    var qr = QRCode.toFile(consts.QRCODELIB + filename, linkedin, {
      color: {
        dark: '#02729a',  // Blue dots
        light: '#0000' // Transparent background
      }
    }, function (err) {
      if (err) throw err
      console.log('created file for qr code')
      return null
    })
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

var QRCode = require('qrcode')
var uuid = require('node-uuid');
var service = {};

service.createStringQRCode= createStringQRCode;
service.createFileQRCode = createFileQRCode;
module.exports = service;

function createStringQRCode(linkedin){
    return new Promise((resolve, reject) => {
      console.log("linkedin: " + linkedin);
      var qr = QRCode.toString(linkedin, function (err, string) {
        if (err) throw err
        console.log(string)
        return string
      })
      resolve(qr);

    });
  };

function createFileQRCode(linkedin){
  return new Promise((resolve, reject) => {
    console.log("linkedin: " + linkedin);
    // Generate a v4 (random) UUID
    var filename = 'qr_images/' + uuid.v4() + '.png';
    // filename -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
    var qr = QRCode.toFile(filename, linkedin, {
      color: {
        dark: '#00F',  // Blue dots
        light: '#0000' // Transparent background
      }
    }, function (err) {
      if (err) throw err
      console.log('done')
    })
    resolve(filename)
  });
};

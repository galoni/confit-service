var QRCode = require('qrcode')


QRCode.toString('http://www.google.com',{
  type: 'terminal'
}, function (err, string) {
  if (err) throw err
  console.log(string)
})
// QRCode.toFile('qr_images/helloqr.png', 'Hello Confit!', {
//   color: {
//     dark: '#00F',  // Blue dots
//     light: '#0000' // Transparent background
//   }
// }, function (err) {
//   if (err) throw err
//   console.log('done')
// })

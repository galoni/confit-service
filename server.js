const express    = require('express'),
      app        = express(),
      bodyParser = require('body-parser'),
      port = process.env.PORT || 3000;

// app.configure(function(){
//     app.use(express.methodOverride());
//     app.use(express.bodyParser());
//     app.use(app.router);
// });

app.set('port',port);
app.use('/', express.static('./public')); //for API
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
    (req,res,next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept");
        next();
});
app.get('/', (req,res) => {
  console.log('Trace: default Address');
});

/*** All routes ***/
app.use('/manager', require('./controllers/managerController'));
app.use('/visitor', require('./controllers/visitorController'));
app.use('/qrcodeApi', require('./api/qrcodeApi'));
app.use('/push', require('./controllers/push_notificationController'));

app.listen(port,
    () => {
        console.log(`listening on port ${port}`);
});

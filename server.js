const express    = require('express'),
      app        = express(),
      bodyParser = require('body-parser'),
      port       = process.env.PORT || 3000;

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
  console.log('Trace: API Page');
  res.sendFile(__dirname + '/api/index.html');
});

/*** All routes ***/
app.use('/manager', require('./controllers/managerController'));
app.use('/visitor', require('./controllers/visitorController'));

app.listen(port,
    () => {
        console.log(`listening on port ${port}`);
});
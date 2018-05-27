var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use('/', indexRouter);

app.post('/form', function(req, res) {

    res.send(JSON.stringify({
        blahblah: "hahahahaha"
    }));

    //res.render('index', { title: "file uploaded"});

/*
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    fileObject = req.files.fileObject;

    // Use the mv() method to place the file somewhere on your server
    fileObject.mv('uploads\\file.dump', function(err) {
        if (err)
            return res.status(500).send(err);

        //res.send('File uploaded!');

        //process the file here.
        //res.render('index', { title: "file uploaded", details: fileObject });

        res.send(JSON.stringify({
            information: "file uploaded"
        }));


    });
*/
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

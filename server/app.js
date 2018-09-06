const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const recursive = require("recursive-readdir");
const fs = require('fs');
const dirTree = require('directory-tree');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const auth = require('http-auth');
const app = express();

app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(fileUpload());

const basic = auth.basic({
    file: __dirname + "/users.htpasswd"
});

app.use(express.static(path.join(__dirname, 'files')))

app.use(function(req, res, next) {
	 //check if its a file name (assumes it has an extension), if it does, its a public route, else its protected
    if (req.path.includes('.')) {
        next();
    } else {
        (auth.connect(basic))(req, res, next);
    }
});

app.use(express.static(path.join(__dirname, 'public')))

app.get('/api', function(req, res) {
  const tree = dirTree(__dirname + "/files" + req.query.path);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(tree));
})

app.post('/upload', (req, res, next) => {
  let imageFile = req.files.file;
  let path = req.body.path;
  imageFile.mv(`${__dirname}/files${path}${imageFile.name}`, function(err) {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    res.sendStatus(200)
  });
})


app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
})

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


var express = require('express');
var bodyParser = require('body-parser');
var $ = require('jquery');
var pgp = require('pg-promise')();


var app = express();
var db = pgp('postgres://postgres:iheartcode@localhost:5432/blogs');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(express.static(__dirname + '/public'));
app.use( function( req, res, next ) {
  if (req.query._method == 'DELETE') {
    req.method = 'DELETE';
    req.url = req.path;
  }
  next();
});


app.get('/', function(req, res, next){
  db.any('SELECT * FROM blog')
    .then(function(data){
      return res.render('index', {data: data});
  })
  .catch(function(err){
    return next(err);
  })
});


app.get('/new', function(req, res, next){
  db.any('SELECT * FROM blog')
    .then(function(data){
      return res.render('new', {data: data});
  })
  .catch(function(err){
    return next(err);
  })
});


app.get('/show/:id', function( req, res, next){
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM blog WHERE id=$1', id)
  .then(function(user){
    return res.render('show', {user: user});
  })
  .catch(function (err){
    return next(err);
  });
});


app.post('/new', function(req, res, next){
  db.none('INSERT into blog(title, date, post)' +
      'values(${blogTitle}, ${postDate}, ${blogPost})',
    req.body)
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});


app.get('/users/:id/edit', function(req, res, next){
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM blog WHERE id=$1', id)
  .then(function(user){
    return res.render('edit', {user: user});
  })
  .catch(function (err){
    return next(err);
  });
});


app.post('/users/:id/edit', function(req, res, next){
  var id = parseInt(req.params.id);
  db.none('UPDATE blog SET title=$1, date=$2, post=$3 WHERE id=$4',
        [req.body.blogTitle, req.body.postDate, req.body.blogPost, id])
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      return next(err);
    });
});


app.get('/users/:id', function(req, res, next){
  var id = parseInt(req.params.id);
  db.result('DELETE FROM blog WHERE id = $1;', id)
  .then(function (result) {
    res.redirect('/');
  })
  .catch(function (err) {
    return next(err);
  });
});


app.listen(3000, function(){
  console.log('working on port 3000');
});

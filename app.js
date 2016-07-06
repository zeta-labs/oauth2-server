'use strict'

var express = require('express');
var cors = require('cors');
var http = require('http');
var bodyParser = require('body-parser');
var oauthserver = require('node-oauth2-server');
var services = require('./services/index.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var request = require('request');
var models = require('./model.js');
var MemcachedStore = require('connect-memcached')(session);

var users = require('./services/users.js');

//MIDDLEWARES
app.use(cors());
app.use(cookieParser());

app.use(session({
  secret : '6f8c27af-7deb-4df5-b0c0-91a6b4d9dc9d',
  key: 'session',
  store : new MemcachedStore({
    hosts: ['127.0.0.1:11211'],
    secret: 'ed1a7901-d342-424e-bce0-38744335358d'
  })
}));

//OAUTH Model configurations
app.oauth = oauthserver({
    model: models,
    grants: ['password', 'authorization_code'],
    debug: true,
    accessTokenLifetime: 60 * 60 * 24,
    clientIdRegex: '^[A-Za-z0-9-_\^]{5,36}$'
});

app.get('/:view?', function(req, res){
  var teste = req.params.view || 'index';
  res.sendFile('/' + teste + '.html', { root: __dirname+'/views' },function(error){
    if(error){
      res.sendStatus(404);
    }
  });
});

app.get('/api/services', app.oauth.authorise(), function(req,res) {
  models.getPermittedResources(req.user.id, 'services', function(error,data){
    if(error) { res.sendStatus(404); return; }
    res.json(data);
  });
});

app.all('/api/services/:id/*', app.oauth.authorise(), function(req,res) {

  models.getResourcePermission(req.user.id, 'services', req.params.id, function(error,data){
    if(error) { res.sendStatus(404); return; }
    if(!data.permission) { res.sendStatus(401); return; }

    var url = data.uri + req.url.split(req.params.id)[1];
    var headers = req.headers;
    headers.authorization = `Token token=${data.options.token}`;

    req.pipe(request({
      url: url,
      headers: headers
    })).pipe(res);
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.all('/oauth/token', app.oauth.grant());

app.get('/oauth/authorize', function (req, res, next) {
    if (!req.session.user) {
      var path        = '/login?redirect=' + req.path,
          clientId    = '&client_id='      + req.query.client_id,
          redirectUri = '&redirect_uri='   + req.query.redirect_uri;
      return res.redirect(path + clientId + redirectUri);
    }
    req.body.allow = 'yes';
    next();
  },app.oauth.authCodeGrant(function (req, next) {
    next(null, req.body.allow === 'yes', req.session.user, req.session.user);
    })
);

app.post('/oauth/authorize', function (req, res, next) {
    if (!req.session.user) {
      var clientId    = '/login?client_id=' + req.query.client_id,
          redirectUri = '&redirect_uri='    + req.query.redirect_uri;
      return res.redirect(clientId + redirectUri);
    }
    req.body.allow = 'yes';
    next();
  }, app.oauth.authCodeGrant(function (req, next) {
    next(null, req.body.allow === 'yes', req.session.user, req.session.user);
}));


app.use(function (req, res, next) {
  res.url = function (path) {
    return [req.protocol+'://'+req.get('host')].concat(path).join('/');
  }
  next();
});

app.post('/users', function(req, res){
<<<<<<< HEAD
  users.create(req.body, function(error, user){
=======
  services.user.create(req.body, function(error, user){
>>>>>>> fd5e684348e1de27ac56f6dc70ca96ef1958fdda
    if(error) {
      res.status(422).json(error);
      return;
    }
    res.location(res.url(['users', user.id]));
    res.status(201).json(user);
  });
});

app.post('/clients', function(req, res){
  services.client.create(req.body, function(error,client){
    if(error){
      res.status(500);
      res.json(error); //TODO tratar erros
    }
    res.status(201);
    res.location(`${req.protocol}://${req.get('host')}${req.originalUrl}/${client.id}`);
    res.json({client_id: client.id, client_secret: client.secret, redirect_uri: client.redirect_uri});
  });
});

app.post('/login', function(req, res){
  req.session.clientId = req.query.client_id ? req.query.client_id : null;
  req.session.redirectUri = req.query.redirect_uri ? req.query.redirect_uri : null;

  services.user.get(req.body,function(error,user){
      if(error){
        res.status(500);
        res.json(error); //TODO tratar erros
      } else if(user) {
        req.session.user = {id: user.id, user: user.username};
        if (req.query.redirect && req.session.clientId) {
          var location = {'Location': `${req.query.redirect}?response_type=code&client_id=${req.session.clientId}&redirect_uri=${req.session.redirectUri}`};
          res.writeHead(307, location);
          res.end();
        }
        res.status(200);
        res.json({description: 'Logged in.'});
      }
  });
});



//SERVER
var server = http.createServer(app);
server.listen(process.argv[2] || 9999, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log(`Web server listening at http://${host}:${port}`);
});

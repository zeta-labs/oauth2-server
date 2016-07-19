'use strict'

var express = require('express');
var cors = require('cors');
var http = require('http');
var bodyParser = require('body-parser');
var oauthserver = require('node-oauth2-server');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var request = require('request');
// var models = require('./model.js');
var MemcachedStore = require('connect-memcached')(session);

var services = require('./services/');

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
    model: services.oauth,
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

// app.get('/api/services', function(req,res) {
app.get('/api/services', app.oauth.authorise(), function(req,res) {
  services.oauth.ownedBy(req.user.id, 'services', function(error,data){
    if(error) { res.sendStatus(404); return; }
    res.json(data);
  });
});

app.all('/api/services/:id/*', app.oauth.authorise(), function(req,res) {

  services.oauth.getResourcePermission(req.user.id, 'services', req.params.id, function(error,data){
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

app.get('/api/users', function(req, res){
  services.users.all(function(error, users){
    if (error) {
      res.status(422).json(error);
      return;
    }
    res.status(200).json(users);
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.all('/oauth/token', app.oauth.grant());

app.get('/oauth/authorize', function (req, res, next) {
    if (!req.session.user) {
      var path = '/login?redirect=' + req.path,
          clientId = '&client_id=' + req.query.client_id,
          redirectUri = '&redirect_uri=' + req.query.redirect_uri;
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

app.delete('/api/access_tokens/:value', function(req, res){
  services.accessTokens.deleteByValue(req.params.value, function(error,data){
    if (error || !data) {
      res.status(422);
      res.end();
      return;
    }
    res.status(200);
    res.end();
  });
});

app.post('/api/services', function(req, res){
  console.log(req.body);
  // res.end();
  services.services.create(req.body, function(error, service){
    if (error) {
      res.status(422).json(error);
      return;
    }
    res.location(res.url(['services', service.id]));
    res.status(201).json(service);
  });
});

app.delete('/api/codes/:code', function(req, res){
  services.codes.delete(req.params.code, function(error,data){
    if (error || !data) {
      res.status(422);
      res.end();
      return;
    }
    res.status(200);
    res.end();
  });
});

app.delete('/api/services/:id', function(req, res){
  services.services.delete(req.params.id, function(error,data){
    if (error || !data) {
      res.status(422);
      res.end();
      return;
    }
    res.status(200);
    res.end();
  });
});

app.post('/api/users', function(req, res){
  services.users.create(req.body, function(error, user){
    if (error) {
      res.status(422).json(error);
      return;
    }
    res.location(res.url(['users', user.id]));
    res.status(201).json(user);
  });
});

//TODO  Security Implementation
app.delete('/api/users/:id', function(req, res){
  services.users.delete(req.params.id, function(error,data){
    if (error || !data) {
      res.status(422);
      res.end();
      return;
    }
    res.status(200);
    res.end();
  });
});

app.post('/api/clients', function(req, res){
  services.clients.create(req.body, function(error,client){
    if (error) {
      res.status(500);
      res.json(error); //TODO tratar erros
    }
    res.status(201);
    res.location(res.url(['clients', client.id]));
    res.json({client_id: client.id, client_secret: client.secret, redirect_uri: client.redirect_uri});
  });
});

//TODO  Security Implementation
app.delete('/api/clients/:id', function(req, res){
  services.clients.delete(req.params.id, function(error,data){
    if (error || !data) {
      res.status(422);
      res.end();
      return;
    }
    res.status(200);
    res.end();
  });
});

app.post('/login', function(req, res){
  req.session.clientId = req.query.client_id ? req.query.client_id : null;
  req.session.redirectUri = req.query.redirect_uri ? req.query.redirect_uri : null;

  services.users.find(req.body,function(error,user){
    if (error) {
      res.status(500);
      res.json(error); //TODO tratar erros
    } else if (user) {
      req.session.user = {id: user.id, user: user.username};
      if (req.query.redirect && req.session.clientId) {
        var location = {'Location': `${req.query.redirect}?response_type=code&client_id=${req.session.clientId}&redirect_uri=${req.session.redirectUri}`};
        // res.redirect(location);
        res.writeHead(307, location);
        res.end();
        console.log('req.session ', req.session);
      }else{
        res.status(200);
        res.json({description: 'Logged in.'});
      }
    }
  });
});



//SERVER
var server = http.createServer(app);
server.listen(process.argv[2] || 9995, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log(`Web server listening at http://${host}:${port}`);
});

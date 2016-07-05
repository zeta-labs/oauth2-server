var express = require('express');
var cors = require('cors');
var http = require('http');
var bodyParser = require('body-parser');
var oauthserver = require('node-oauth2-server');
var routes = require('./routes.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var request = require('request');
var models = require('./model.js');
var MemcachedStore = require('connect-memcached')(session);

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

app.post('/users', routes.user);

app.post('/clients', routes.client);

app.post('/login', routes.login);

//SERVER
var server = http.createServer(app);
server.listen(process.argv[2] || 9999, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log(`Web server listening at http://${host}:${port}`);
});

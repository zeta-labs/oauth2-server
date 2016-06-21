var express = require('express'),
    cors = require('cors'),
    http = require('http'),
    bodyParser = require('body-parser'),
    oauthserver = require('oauth2-server'),
    routes = require('./routes_pg.js'),
    // routes = require('./routes_mongo.js'),
    port = 9999,
    cookieParser = require('cookie-parser'),
    session = require('express-session');

var app = express();
var server = app.listen(port);
app.use(cors());
app.use(cookieParser());
app.use(session({secret: 'FFKPSDFKPWFKPW24324-09cd'}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.oauth = oauthserver({
    model: require('./model_pg.js'), // See below for specification
    // model: require('./model_mongo.js'), // See below for specification
    grants: ['password', 'authorization_code'],
    debug: true,
    accessTokenLifetime: 60 * 60 * 24,
    clientIdRegex: '^[A-Za-z0-9-_\^]{5,30}$'
});
//routes
app.all('/oauth/token', app.oauth.grant());
app.get('/clientRegister', routes.getClientRegister);
app.post('/clientRegister', routes.postClientRegister);
app.get('/getToken', routes.getAToken);
app.get('/register', routes.getRegister);
app.get('/', routes.home);
app.post('/register', routes.postRegister);
app.get('/login', routes.login);
app.post('/login', routes.postLogin);
//our pointless api endpoints
app.get('/api/random', app.oauth.authorise(), routes.getQuoteRandom);
app.get('/api/id/:id', app.oauth.authorise(), routes.getQuoteById);
//TODO: complete these routes that actually make implementing OAuth meaningful
app.get('/api/user/get/quote', app.oauth.authorise(), routes.getUserQuotes);
app.get('/api/user/add/quote', app.oauth.authorise(), routes.addUserQuote);



// Handle authorise code grant type

app.get('/oauth/authorise', function (req, res, next) {
  if (!req.session.user) {
    // If they aren't logged in, send them to your own login implementation
    return res.redirect('/login?redirect=' + req.path + '&client_id=' +
    req.query.client_id + '&redirect_uri=' + req.query.redirect_uri);
  }
  //TODO:  SHOW THEM  'do you authorise xyz app to access your content?' page
  req.body.allow = 'yes';
  next();
}, app.oauth.authCodeGrant(function (req, next) {
  // The first param should to indicate an error
  // The second param should a bool to indicate if the user did authorise the app
  // The third param should for the user/uid (only used for passing to saveAuthCode)
  next(null, req.body.allow === 'yes', req.session.user, req.session.user);
}));

app.post('/oauth/authorise', function (req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login?client_id=' + req.query.client_id +
    '&redirect_uri=' + req.query.redirect_uri);
  }
  //TODO:  SHOW THEM  'do you authorise xyz app to access your content?' page
  req.body.allow = 'yes';
  next();
}, app.oauth.authCodeGrant(function (req, next) {
  // The first param should to indicate an error
  // The second param should a bool to indicate if the user did authorise the app
  // The third param should for the user/uid (only used for passing to saveAuthCode)
  next(null, req.body.allow === 'yes', req.session.user, req.session.user);
}));

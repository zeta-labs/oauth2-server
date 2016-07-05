var pgConn = 'postgres://postgres:postgres@localhost:5432/oauth';
var pg = require('pg');
var knex = require('knex')({
  client: 'pg',
  connection: pgConn
});

exports.isValidCredentials = function(username, password){
  return (username && username.match('^[A-Za-z0-9-_\^]{5,30}$') && password && password.length > 2)? true : false;
};


exports.createUser = function(user, callback) {
  knex('users')
    .insert(user)
    .returning('*')
    .then(function(data) {
      callback(null,data);
    })
    .catch(function(error) {
      callback(error);
    });
};


exports.user = function(req,res) {
  var username = req.body.username || '';
  var password = req.body.password || '';

  if(exports.isValidCredentials(username,password)){
    knex('users')
    .insert({username: username, password: password})
    .then(function(resp) {
      exports.respondsWith({response: res,type: 'success',status: 201,contentType: 'application/json'});
    })
    .catch(function(err) {
      exports.respondsWith({response: res, type: 'server_error', description: 'Database connection error.', contentType: 'application/json'});
    });
  }else {
    exports.respondsWith({response: res, type:'invalid_request', description: 'Invalid credentials.', contentType: 'application/json'});
  }
};

exports.client = function(req,res) {
  var redirectUri = req.body.redirect_uri || '';

  knex('clients')
  .insert({redirect_uri: redirectUri})
  .returning(['id','secret'])
  .then(function(result) {
    var client = result[0];
    res.end(JSON.stringify({client_id : client.id, client_secret: client.secret, redirect_uri: redirectUri}));
  })
  .catch(function(err) {
    exports.respondsWith({response: res, type: 'server_error', contentType: 'application/json'});
  });
}

exports.login = function(req,res) {
  var redirect = req.query.redirect ? req.query.redirect : null;
  var username = req.body.username || '';
  var password = req.body.password || '';

  req.session.clientId = req.query.client_id ? req.query.client_id : '';
  req.session.redirectUri = req.query.redirect_uri ? req.query.redirect_uri : '';

  knex.select('*')
  .from('users')
  .where({username: username, password: password})
  .then(function(result) {
    var user = result[0];
    req.session.user = {id: user.id,user: user.username};
    if (redirect && req.session.clientId) {
      var location = {'Location': `${redirect}?response_type=code&client_id=${req.session.clientId}&redirect_uri=${req.session.redirectUri}`};
      res.writeHead(307, location);
      res.end();
    }
    exports.respondsWith({response: res, type: 'success', status: 200, description: 'Logged in.'});
  }).catch(function(error) {
    console.log(error);
    exports.respondsWith({response: res, type: 'server_error', description: 'Database connection error.', contentType: 'application/json'});
  });
}

exports.respondsWith = function(responseObject){
  var response = responseObject.response;
  var type = responseObject.type;
  var description = responseObject.description;
  var status = responseObject.status;
  var contentType = responseObject.contentType;

  if(contentType){
    //'application/json'
    response.setHeader('Content-Type',contentType);
  }

  switch(type) {
    case 'success':
      response.status(status || 200);
      response.end(JSON.stringify({status: description || 'success'}));
      break;
    case 'invalid_request':
      response.status(status || 400);
      response.setHeader('Pragma','no-cache');
      response.setHeader('Cache-Control','no-store');
      response.end(JSON.stringify({error: type, error_description: description || 'Invalid credentials.'}));
      break;
    case 'unauthorized_client':
      break;
    case 'access_denied':
      response.status(status || 401);
      response.end(JSON.stringify({error: type, error_description: description || 'Invalid credentials.'}));
      break;
    case 'unsupported_response_type':
      break;
    case 'invalid_scope':
      break;
    case 'server_error':
      response.status(status || 500);
      response.end(JSON.stringify({error: type, error_description: description || 'Server error.'}));
      break;
    case 'temporarily_unavailable':
      break;
  }
};

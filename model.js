'use strict'
/**
  Authorization Code grant
    getAccessToken
    getClient
    saveAuthorizationCode

  Password grant
    getAccessToken
    getClient
    getUser
    saveToken

  Refresh token grant
    getAccessToken
    getClient
    getRefreshToken
    saveToken

  Client Credentials grant
    getAccessToken
    getClient
    saveToken
**/

var model = module.exports;
var pg = require('pg');
var pgConn = 'postgres://postgres:postgres@localhost/oauth';
var services = require('./services/');

/*
 * Required to support password grant type
 */
model.getUser = function (username, password, callback) {
  services.users.find({ username, password }, callback);
};

model.getClient = function (clientId, clientSecret, callback) {
  services.clients.find({id: clientId}, function(error, client){
    if (error) { callback(error); }
    callback(null, {
      clientId: client.id,
      clientSecret: client.secret,
      redirectUri: client.redirect_uri
    });
  });
};

model.getAccessToken = function (bearerToken, callback) {
  services.accessTokens.find({value: bearerToken},function(error, token){
    if (error) { callback(error); }
    callback(null, {
      accessToken: token.value,
      clientId: token.client_id,
      expires: token.expires_in,
      userId: token.user_id
    });
  });
};

// renamed to saveToken in version 3.x
model.saveAccessToken = function (accessToken, clientId, expires, user, callback) {

  services.accessTokens.create({
    value: accessToken,
    expires_in: expires,
    client_id: clientId,
    user_id: user.id
  }, callback);

};

// renamed to getAuthorizationCode in version 3.x
model.getAuthCode = function(bearerCode,callback) {
  services.codes.find({value: bearerCode}, function(error, code){
    if (error) { callback(error); }
    callback(null,{
      clientId: code.client_id,
      expires: code.expires_in * 1000,
      userId: code.user_id
    })
  });
};


//auth code grant type
// renamed to saveAuthorizationCode in versin 3.x
model.saveAuthCode = function(authCode, clientId, expires, user, callback) {
  services.codes.create({
    value: authCode,
    expires_in: parseInt(expires / 1000, 10),
    client_id: clientId,
    user_id: user.id
  }, callback);
};






model.ownedBy = function (userId, resourceType, callback) {
  /**
  knex.select([
    `${resourceType}.id`,
    `${resourceType}.name`,
    `${resourceType}.uri`,
    'users_has_resources.options'
  ])
  .from('users_has_resources')
  .join(resourceType, {
    'users_has_resources.resource_id' : `${resourceType}.id`,
    'users_has_resources.user_id' : userId,
    'users_has_resources.resource_type' : resourceType,
    'users_has_resources.permission' : 'TRUE'
  })
  .then(rows => {
    console.log(rows);
    // callback(null,rows);
  })
  .catch(error => callback(error));
  **/

  pg.connect(pgConn, function(err, client, done) {
    if (err) {
      return console.error('pg connection error ', err);
    }
    var query = 'SELECT rs.id, rs.name, rs.uri, ur.options FROM users_has_resources ur JOIN ' + resourceType + ' rs ON ur.resource_id = rs.id AND ur.user_id = $1 AND ur.resource_type = $2 AND ur.permission = TRUE;'
    client.query(query, [userId,resourceType], function(err, result) {
      done();
      console.error(err);
      if (err) {
        callback(err);
        return;
      }
      if (result.rows.length === 0) {
        callback(true);
        return;
      }
      callback(null, result.rows);
    });
  });
};

model.getResourcePermission = function (userId, resourceType, resourceId, callback) {
  pg.connect(pgConn, function(err, client, done) {
    if (err) {
      return console.error('pg connection error ', err);
    }
    var query = 'SELECT r.name, r.uri, p.* FROM users_has_resources p JOIN ' + resourceType + ' r ON r.id = p.resource_id AND p.user_id = $1 AND p.resource_type = $2 AND p.resource_id = $3;'
    client.query(query, [userId,resourceType,resourceId], function(err, result) {
      done();

      if (err) {
        callback(err);
        return;
      }
      if (result.rows.length === 0) {
        callback(true);
        return;
      }

      var resourcePermission = result.rows[0];

      callback(null, {
        name: resourcePermission.name,
        uri: resourcePermission.uri,
        userId: resourcePermission.user_id,
        resourceId: resourcePermission.resource_id,
        resourceType: resourcePermission.resource_type,
        createdAt: resourcePermission.created_at,
        options: resourcePermission.options,
        permission: resourcePermission.permission
      });
    });
  });
};




/* REFRESH TOKEN IS NOT TESTED */
model.getRefreshToken = function (bearerToken, callback) {
  db.oauth_refresh_tokens.find({'refresh_token' : bearerToken}, function(err,users) {
    callback(err, users && users.length ? users[0] : false);
  });
};

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to resrict certain grant types
var authorizedClientIds = ['1234215215', 'def2'];
model.grantTypeAllowed = function (clientId, grantType, callback) {
  // LOGIC TO CHECK IF THE grantType is allowed for the particular clientId
  return callback(false,true);
  if (grantType === 'password') {
      return callback(false, /*authorizedClientIds.indexOf(clientId.toLowerCase()) >= 0*/true);
  }
};

/* REFRESH TOKEN IS NOT TESTED */
model.saveRefreshToken = function (refreshToken, clientId, expires, userId, callback) {
  db.oauth_refresh_tokens.save({refresh_token: refreshToken, client_id: clientId, user_id: userId, expires:expires},function(err,saved) {
    callback(err);
  })
};

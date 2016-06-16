  var model = module.exports,
    databaseUrl = "oauth",
    collections = ['oauth_access_tokens', 'oauth_clients', "oauth_refresh_tokens", "users", 'oauth_codes'],
    db = require("mongojs")(databaseUrl, collections);


model.getAccessToken = function (bearerToken, callback) {
    db.oauth_access_tokens.find({'access_token': bearerToken}, function (err, users) {
      if (err || !users || !users.length) return callback(err);
      // This object will be exposed in req.oauth.token
      // The user_id field will be exposed in req.user (req.user = { id: "..." }) however if
      // an explicit user object is included (token.user, must include id) it will be exposed
      // in req.user instead
      var token = users[0];
      callback(null, {
        accessToken: token.access_token,
        clientId: token.client_id,
        expires: token.expires,
        userId: token.userId
      });
    });
};

model.getClient = function (clientId, clientSecret, callback) {
  db.oauth_clients.find({"client_id":  clientId}, function(err,users) {
    if (err || !users.length) return callback(err);
    var client = users[0];
    if (clientSecret !== null && client.client_secret !== clientSecret) return callback();
    // This object will be exposed in req.oauth.client
    callback(null, {
      clientId: client.client_id,
      clientSecret: client.client_secret,
      redirectUri: client.redirect_uri,
      userId: client._id
    });
  });
};

/* REFRESH TOKEN IS NOT TESTED */
model.getRefreshToken = function (bearerToken, callback) {
  db.oauth_refresh_tokens.find({"refresh_token" : bearerToken}, function(err,users) {
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

model.saveAccessToken = function (accessToken, clientId, expires, userId, callback) {
  db.oauth_access_tokens.save({access_token : accessToken, client_id : clientId, user_id: userId, expires: expires},function(err,saved) {
      callback(err);
  })
  /*
  client.query('INSERT INTO oauth_access_tokens(access_token, client_id, user_id, expires) ' +
      'VALUES ($1, $2, $3, $4)', [accessToken, clientId, userId, expires],
      function (err, result) {
          callback(err);
    });
  */
};

/* REFRESH TOKEN IS NOT TESTED */
model.saveRefreshToken = function (refreshToken, clientId, expires, userId, callback) {
  db.oauth_refresh_tokens.save({refresh_token: refreshToken, client_id: clientId, user_id: userId, expires:expires},function(err,saved) {
    callback(err);
  })
};

/*
 * Required to support password grant type
 */
model.getUser = function (username, password, callback) {
  db.users.find({"username":  username, password: password},function(err,users) {
    callback(err, users && users.length ? users[0] : false);
  })
};


//auth code grant type
model.saveAuthCode = function(authCode, clientId, expires, user, callback) {
  var code = {
    authCode: authCode,
    clientId: clientId,
    userId: user.id
  };
  if (expires) code.expires = parseInt(expires / 1000, 10);
  db.oauth_codes.save(code, callback);
};

model.getAuthCode = function(bearerCode,callback) {
  db.oauth_codes.find({authCode: bearerCode},function(err,codes) {
    code = codes[0];
    if (code && code.expires) {
        code.expires = new Date(code.expires * 1000);
    }
    callback(err,code);
  })
};

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

var model = module.exports,
    pg    = require('pg'),
    pgConn= 'postgres://postgres:postgres@localhost/oauth';

model.getAccessToken = function (bearerToken, callback) {
  pg.connect(pgConn, function(err, client, done) {
    if (err) {
      console.error('pg connection error ', err);
      callback(err);
    }
    client.query('SELECT * FROM access_tokens WHERE value = $1;', [bearerToken], function(err, result) {
      done();

      if (err || !result.rows.length) return callback(err);
      var token = result.rows[0];

      callback(null, {
        accessToken: token.value,
        clientId: token.client_id,
        expires: token.expires_in,
        userId: token.user_id
      });
    });
  });
};

// renamed to saveToken in version 3.x
model.saveAccessToken = function (accessToken, clientId, expires, user, callback) {
  pg.connect(pgConn, function(err, client, done) {
    if (err) {
      console.error('pg connection error ', err);
      callback(err);
    }

    client.query('INSERT INTO access_tokens(value, expires_in, client_id, user_id) VALUES ($1, $2, $3, $4);', [accessToken,expires,clientId,user.id], function(err, result) {
      done();
      if(err) {
        console.error('error running query', err);
        callback(err);
      }
      callback();
    });
  });
};

model.getClient = function (clientId, clientSecret, callback) {
  pg.connect(pgConn, function(err, client, done) {
    if (err) {
      return console.error('pg connection error ', err);
    }
    client.query('SELECT * FROM clients WHERE id = $1;', [clientId], function(err, resultClients) {
      done();

      if (err || !resultClients.rows.length) return callback(err);

      var resultClient = resultClients.rows[0];
      if (clientSecret !== null && resultClient.secret !== clientSecret) return callback();
      callback(null, {
        clientId: resultClient.id,
        clientSecret: resultClient.secret,
        redirectUri: resultClient.redirect_uri
      });
    });
  });
};

model.getPermittedResources = function (userId, resourceType, callback) {
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

/*
 * Required to support password grant type
 */
model.getUser = function (username, password, callback) {
  pg.connect(pgConn, function(err, client, done) {
    if (err) {
      return console.error('pg connection error ', err);
    }
    client.query('SELECT * FROM users WHERE username = $1 AND password = $2;', [username,password], function(err, result) {
      done();
      if(err) {
        return console.error('error running query', err);
      }
      var users = result.rows;
      callback(err, users && users.length ? users[0] : false);
    });
  });
};


//auth code grant type
// renamed to saveAuthorizationCode in versin 3.x
model.saveAuthCode = function(authCode, clientId, expires, user, callback) {
  pg.connect(pgConn, function(err, client, done) {
    if (err) {
      return console.error('pg connection error ', err);
    }

    client.query('INSERT INTO codes(value, expires_in, client_id, user_id) VALUES ($1, $2, $3, $4);', [authCode,parseInt(expires / 1000, 10),clientId,user.id], function(err, result) {
      done();
      if(err) {
        return console.error('error running query ##', err);
      }
      var oauthCode = result.rows[0];
      callback();
    });
  });
};

 // renamed to getAuthorizationCode in version 3.x
model.getAuthCode = function(bearerCode,callback) {
  pg.connect(pgConn, function(err, client, done) {
    if (err) {
      return console.error('pg connection error ', err);
    }
    client.query('SELECT * FROM codes WHERE value = $1;', [bearerCode], function(err, result) {
      done();
      if (err || !result.rows.length) return callback(err);

      var code = result.rows[0];
      if (code && code.expires_in) {
        // code.expires_in = new Date(code.expires_in * 1000);
        code.expires_in = code.expires_in * 1000;
      }

      var authorizationCode = {
        clientId: code.client_id,
        expires: code.expires_in,
        userId: code.user_id
      }

      callback(err,authorizationCode);
    });
  });
};

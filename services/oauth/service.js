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

let services = require('../index');

class OauthService {

  constructor(knex) {
    this.knex = knex;
  }

  // Required to support password grant type
  getUser(username, password, callback) {
    services.users.find({ username, password }, callback);
  };

  getClient(clientId, clientSecret, callback) {
    services.clients.find({id: clientId}, function(error, client){
      if (error) { callback(error); }
      callback(null, {
        clientId: client.id,
        clientSecret: client.secret,
        redirectUri: client.redirect_uri
      });
    });
  };

  getAccessToken(bearerToken, callback) {
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
  saveAccessToken(accessToken, clientId, expires, user, callback) {
    services.accessTokens.create({
      value: accessToken,
      expires_in: expires,
      client_id: clientId,
      user_id: user.id
    }, callback);
  };

  // renamed to getAuthorizationCode in version 3.x
  getAuthCode(bearerCode,callback) {
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
  saveAuthCode(authCode, clientId, expires, user, callback) {
    services.codes.create({
      value: authCode,
      expires_in: parseInt(expires / 1000, 10),
      client_id: clientId,
      user_id: user.id
    }, callback);
  };

  //TODO TESTAR
  getPermittedResources(userId, resourceType, callback){
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
      callback(null,rows);
    })
    .catch(error => callback(error));
  };

  //TODO: TESTAR
  getResourcePermission(userId, resourceType, resourceId, callback) {
    knex.select([
      `${resourceType}.name`,
      `${resourceType}.uri`,
      'users_has_resources.*'
    ])
    .from('users_has_resources')
    .join(resourceType, {
      'users_has_resources.resource_id' : `${resourceType}.id`,
      'users_has_resources.user_id' : userId,
      'users_has_resources.resource_type' : resourceType,
      'users_has_resources.resource_id' : resourceId
    })
    .then(rows => {
      var resourcePermission = rows[0];
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
    })
    .catch(error => callback(error));
  };




  // TODO refactor
  // This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
  // it gives an example of how to use the method to resrict certain grant types
  // var authorizedClientIds = ['1234215215', 'def2'];
  grantTypeAllowed(clientId, grantType, callback) {
    // LOGIC TO CHECK IF THE grantType is allowed for the particular clientId
    return callback(false,true);
    if (grantType === 'password') {
        return callback(false, /*authorizedClientIds.indexOf(clientId.toLowerCase()) >= 0*/true);
    }
  };

  /* REFRESH TOKEN IS NOT TESTED */
  getRefreshToken(bearerToken, callback) {
    db.oauth_refresh_tokens.find({'refresh_token' : bearerToken}, function(err,users) {
      callback(err, users && users.length ? users[0] : false);
    });
  };
  /* REFRESH TOKEN IS NOT TESTED */
  saveRefreshToken(refreshToken, clientId, expires, userId, callback) {
    db.oauth_refresh_tokens.save({refresh_token: refreshToken, client_id: clientId, user_id: userId, expires:expires},function(err,saved) {
      callback(err);
    })
  };
}

module.exports = OauthService;
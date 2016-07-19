var Request = require("request");
var assert = require('chai').assert;
var URL = 'http://localhost:80';

describe('Oauth2-server FLOW', function() {
  var user;
  var client;
  var token;
  var redirects;
  var sessionCookie;
  var authorization = {
    location: '',
    code: ''
  }
  var bearer;

  it('Should add a SINGLE user on /api/users POST.', function(done) {
    var request = {
      method: 'POST',
      url: URL + '/api/users',
      headers:{
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache'
      },
      form: {
        username: 'testpassword2',
        password: 'testpassword2',
        email: 'ivoneijr2@gmail.com'
      }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      user = JSON.parse(body);
      assert.equal(response.statusCode, 201);
      done();
    });
  });

  it('Should add a SINGLE client on /api/clients POST.', function(done) {
    var request = {
      method: 'POST',
      url: URL + '/api/clients',
      headers:{ 'content-type': 'application/x-www-form-urlencoded' },
      form: { redirect_uri: 'http://www.yahoo.com' }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      client = JSON.parse(body);
      assert.equal(response.statusCode, 201);
      done();
    });
  });

  it('[authorization_code step 1] Should get session cookie and get redirects on /oauth/authorize.', function(done) {
    var request = {
      method: 'GET',
      url: URL + '/oauth/authorize',
      qs: {
        response_type: 'code',
        client_id: client.client_id,
        redirect_uri: client.redirect_uri
      }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      redirects = response.request._redirect.redirects;
      assert.equal(redirects[0].statusCode, 302);
      sessionCookie = response.headers['set-cookie'].pop().split(';')[0];
      done();
    });
  });

  it('[authorization_code step 2] Should login, set session on api and get recidect location.', function(done) {
    var request = {
      method: 'POST',
      url: redirects[0].redirectUri,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Cookie' : sessionCookie,
        'Connection' : 'keep-alive'
      },
      qs: {
        redirect: '/oauth/authorize',
        client_id: client.client_id,
        redirect_uri: client.redirect_uri
      },
      form: {
        username: user.username,
        password: user.password
      }
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 307);
      authorization.location = response.headers.location;
      done();
    });
  });

  it('[authorization_code step 3] Should get "authorization_code".', function(done) {
    var request = {
      method: 'POST',
      url: URL + authorization.location,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Cookie' : sessionCookie,
        'Connection' : 'keep-alive',
        'Referer' : URL + authorization.location
      },
      qs: {
        response_type: 'code',
        client_id: client.client_id,
        redirect_uri: client.redirect_uri
      },
      form: {
        username: user.username,
        password: user.password
      }
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 302);
      authorization.code = response.headers.location.split('=')[1];
      done();
    });
  });

  it('[authorization_code step 4] Should get bearer.', function(done) {
    var request = {
      method: 'POST',
      url: URL + '/oauth/token',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        grant_type: 'authorization_code',
        code: authorization.code,
        client_id: client.client_id,
        client_secret: client.client_secret,
        username: user.username,
        password: user.password
      }
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      bearer = JSON.parse(body);
      done();
    });
  });

  it('Should get services.', function(done) {
    done();
    // this.http.get(`http://prod-04:80/api/services/${id}/entities/${prefix}ecli?filter[codfilial]=${codfilial}&fields=codcliente,nome,cpf_cgc,pessoa,codfilial`,{ headers: headers })
    // var request = {
    //   method: 'GET',
    //   url: URL + '/api/services',
    //   headers: {
    //     'Connection' : 'keep-alive',
    //     'Authorization' : `Bearer ${bearer.access_token}`
    //   }
    // }
    // Request(request, function (error, response, body) {
    //   if (error) console.error(error);
    //   assert.equal(response.statusCode, 200);
    //   done();
    //   console.log(body);
    // });
  });

  it('Should DELETE code on /api/codes/:code.', function(done) {
    var request = {
      method: 'DELETE',
      url: URL + '/api/codes/' + authorization.code
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE a access token generated by grant type authorization_code on /api/access_tokens/:value.', function(done) {
    var request = {
      method: 'DELETE',
      url: URL + '/api/access_tokens/' + bearer.access_token
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });


  it('Should get token with grant type "password".', function(done) {
    var request = {
      method: 'POST',
      url: URL + '/oauth/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache'
      },
      form: {
        grant_type: 'password',
         client_id: client.client_id,
         username: user.username,
         password: user.password,
         client_secret: client.client_secret
       }
     };
     Request(request, function (error, response, body) {
      if (error) console.error(error);
      token = JSON.parse(body);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE a access token generated by grant type password on /api/access_tokens/:value.', function(done) {
    var request = {
      method: 'DELETE',
      url: URL + '/api/access_tokens/' + token.access_token
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE a SINGLE USER on /api/users/:value.', function(done) {
    var request = {
      method: 'DELETE',
      url: URL + '/api/users/' + user.id
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE a SINGLE CLIENT on /api/clients/:id.', function(done) {
    var request = {
      method: 'DELETE',
      url: URL + '/api/clients/' + client.client_id
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

});

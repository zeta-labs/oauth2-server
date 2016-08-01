var Request = require("request");
var assert = require('chai').assert;
var expect = require('chai').expect;
var Url = require('url');
var BASE_URL = 'http://localhost:8080';

describe('Oauth2-server FLOW', function() {
  var user;
  var client;
  var service;
  var userHasResources;
  var token;
  var redirects;
  var sessionCookie;
  var authorization = {
    location: '',
    code: ''
  }
  var bearer;

  it('Should CREATE a single USER', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/users',
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

  it('Should login with valid credentials', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/login',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      form: {
        username: user.username,
        password: user.password
      }
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should REVOKE access by missing credentials', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/login',
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 422);
      done();
    });
  });

  it('Should REVOKE access by invalid credentials', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/login',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      form: {
        username: Math.floor(Math.random() * 999),
        password: Math.floor(Math.random() * 999)
      }
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 401);
      done();
    });
  });


  it('Should CREATE a single client', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/clients',
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

// INIT AUTHORIZATION_CODE GRANT FLOW
  it('Should CREATE a single RESOURCE with type SERVICE used by AUTHORIZATION_CODE', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/api/services',
      headers:{ 'content-type': 'application/x-www-form-urlencoded' },
      form: { name: 'Baren Test', uri: 'http://zetainfo.dyndns.info:5001/api/v1' }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      service = JSON.parse(body);
      assert.equal(response.statusCode, 201);
      done();
    });
  });

  it('[authorization_code step 1] Should GET session cookie and get redirects', function(done) {
    var request = {
      method: 'GET',
      url: BASE_URL + '/oauth/authorize',
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

  it('[authorization_code step 2] Should LOGIN, SET SESSION on api and GET recidect LOCATION', function(done) {
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

  it('[authorization_code step 3] Should GET authorization code', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + authorization.location,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Cookie' : sessionCookie,
        'Connection' : 'keep-alive',
        'Referer' : BASE_URL + authorization.location
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

  it('[authorization_code step 4] Should GET bearer', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/oauth/token',
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

  it('Should CREATE permission ("users_has_resources" relationship)', function(done) {
    this.timeout(30000);
    var request = {
      method: 'POST',
      url: BASE_URL + '/api/services/' + service.id + '/bind',
      headers:{
        'Authorization' : `Bearer ${bearer.access_token}`,
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        username: "zeta",
        password: "a119comz"
      }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 201);
      userHasResources = JSON.parse(body);
      done();
      this.timeout(2000);
    });
  });

  it('Should GET services', function(done) {
    var request = {
      method: 'GET',
      url: BASE_URL + '/api/services',
      headers: {
        'Connection' : 'keep-alive',
        'Authorization' : `Bearer ${bearer.access_token}`
      }
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should GET request from service(middleware ex)', function(done) {
    var id = userHasResources.resource_id;
    var prefix = userHasResources.options.system.type;
    var codfilial = userHasResources.options.organizations[0].id;

    var request = {
      method: 'GET',
      url: `${BASE_URL}/api/services/${id}?request=/entities/${prefix}ecli?filter[codfilial]=${codfilial}&fields=codcliente,nome,cpf_cgc,pessoa,codfilial`,
      headers: {
        'Connection' : 'keep-alive',
        'Authorization' : `Bearer ${bearer.access_token}`
      }
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  // Only works if access_token lifetime (server-side) is less than sleep function parameter
    // it('Should get invalid_token (access_token has expired) from grant type authorization_code', function(done) {
    //
    //   this.timeout(30000);
    //   function sleep (time) {
    //     return new Promise((resolve) => setTimeout(resolve, time));
    //   }
    //
    //   sleep(6000).then(() => {
    //     var request = {
    //       method: 'GET',
    //       url: BASE_URL + '/api/services',
    //       headers: {
    //         'Connection' : 'keep-alive',
    //         'Authorization' : `Bearer ${bearer.access_token}`
    //       }
    //     }
    //     Request(request, function (error, response, body) {
    //       if (error) console.error(error);
    //
    //       var redirects = response.request._redirect.redirects;
    //       assert.equal(redirects[0].statusCode, 302);
    //
    //       var queryParams = Url.parse(redirects[0].redirectUri, true).query;
    //       assert.equal(queryParams.error, 'invalid_token');
    //
    //       done();
    //       this.timeout(2000);
    //     });
    //   });
    // });

  it('Should REFRESH token generated by grant_type=AUTHORIZATION_CODE', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/oauth/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie' : sessionCookie,
        'Connection' : 'keep-alive',
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: bearer.refresh_token,
        client_id: client.client_id,
        username: user.username,
        password: user.password,
        client_secret: client.client_secret
       }
     };
     Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      bearer = JSON.parse(body);
      done();
    });
  });

  it('Should DELETE code', function(done) {
    var request = {
      method: 'DELETE',
      url: BASE_URL + '/api/codes/' + authorization.code
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE permission (users_has_resources relationship)', function(done) {
    var request = {
      method: 'DELETE',
      url: BASE_URL + `/api/oauth/${userHasResources.user_id}&${userHasResources.resource_id}&${userHasResources.resource_type}`
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE a single RESOURCE with type SERVICE used by grant_type=AUTHORIZATION_CODE', function(done) {
    var request = {
      method: 'DELETE',
      headers: {
        'Connection' : 'keep-alive',
        'Authorization' : `Bearer ${bearer.access_token}`
      },
      url: BASE_URL + '/api/services/' + service.id
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE access token generated by grant_type=AUTHORIZATION_CODE', function(done) {
    var request = {
      method: 'DELETE',
      url: BASE_URL + '/api/access_tokens/' + bearer.access_token
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });
// END AUTHORIZATION_CODE GRANT FLOW


// INIT PASSWORD GRANT FLOW
  it('Should CREATE a single RESOURCE, type SERVICE used by grant_type=PASSWORD', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/api/services',
      headers:{ 'content-type': 'application/x-www-form-urlencoded' },
      form: { name: 'Baren Test', uri: 'http://zetainfo.dyndns.info:5001/api/v1' }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      service = JSON.parse(body);
      assert.equal(response.statusCode, 201);
      done();
    });
  });

  it('Should GET token by grant type password', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/oauth/token',
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

  it('Should CREATE permission ("users_has_resources" relationship)', function(done) {
    this.timeout(30000);
    var request = {
      method: 'POST',
      url: BASE_URL + '/api/services/' + service.id + '/bind',
      headers:{
        'Authorization' : `Bearer ${token.access_token}`,
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        username: "zeta",
        password: "a119comz"
      }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 201);
      userHasResources = JSON.parse(body);
      done();
      this.timeout(2000);
    });
  });

  it('Should GET services', function(done) {
    var request = {
      method: 'GET',
      url: BASE_URL + '/api/services',
      headers: {
        'Connection' : 'keep-alive',
        'Authorization' : `Bearer ${token.access_token}`
      }
    }
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should REFRESH token generated by grant_type=PASSWORD', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/oauth/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie' : sessionCookie,
        'Connection' : 'keep-alive',
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
        client_id: client.client_id,
        username: user.username,
        password: user.password,
        client_secret: client.client_secret
       }
     };
     Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      token = JSON.parse(body);
      done();
    });
  });

  it('Should DELETE permission (users_has_resources relationship)', function(done) {
    var request = {
      method: 'DELETE',
      url: BASE_URL + `/api/oauth/${userHasResources.user_id}&${userHasResources.resource_id}&${userHasResources.resource_type}`
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE a single RESOURCE, type SERVICE used by grant_type=PASSWORD', function(done) {
    var request = {
      method: 'DELETE',
      headers: {
        'Connection' : 'keep-alive',
        'Authorization' : `Bearer ${token.access_token}`
      },
      url: BASE_URL + '/api/services/' + service.id
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE access token generated by grant_type=PASSWORD', function(done) {
    var request = {
      method: 'DELETE',
      url: BASE_URL + '/api/access_tokens/' + token.access_token
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });
// END PASSWORD GRANT FLOW

  it('Should DELETE a single user', function(done) {
    var request = {
      method: 'DELETE',
      url: BASE_URL + '/users/' + user.id
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE a single client', function(done) {
    var request = {
      method: 'DELETE',
      url: BASE_URL + '/clients/' + client.client_id
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should RETURN oauth2 error response pattern following RFC 6749 section-4.1.2.1', function(done) {
    var request = {
      method: 'GET',
      url: BASE_URL + '/oauth/authorize',
      headers: {
        'Cookie' : sessionCookie,
        'Connection' : 'keep-alive'
      }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);

      var redirects = response.request._redirect.redirects;
      assert.equal(redirects[0].statusCode, 302);
      assert.notEqual(redirects[0].redirectUri.indexOf("error="), -1);
      assert.notEqual(redirects[0].redirectUri.indexOf("error_description="), -1);
      done();
    });
  });
});

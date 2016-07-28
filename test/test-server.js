var Request = require("request");
var assert = require('chai').assert;
var expect = require('chai').expect;
var Url = require('url');
var BASE_URL = 'http://prod-04:80';

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

  it('Should CREATE a single user', function(done) {
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

  it('Should CREATE a single resource, type service', function(done) {
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

  it('Should CREATE "users_has_resources" relationship', function(done) {
    var request = {
      method: 'POST',
      url: BASE_URL + '/api/oauth',
      headers:{ 'content-type': 'application/x-www-form-urlencoded' },
      form: {
        user_id: user.id,
        resource_id: service.id,
        resource_type: 'services',
        options: {"id": 0, "email": null, "token": "37bdbddb-d295-439b-8074-a58a727ad20e", "system": {"type": "zw14"}, "profile": null, "username": "okmbtew14119", "organizations": [{"id": 1, "code": "Baren Iluminação Eireli", "profile": {"uf": "RS", "cep": "90220160", "fax": "(51) 3062-3233", "cnae": "4754703", "cnpj": "08917340000193", "fone": "(51) 3062-3233", "pais": "BRASIL", "site": "www.treeluxbrasil.com.br", "email": "deposito@treeluxbrazil.com.br", "rntrc": null, "sigla": null, "bairro": "Floresta", "cidade": "Porto Alegre", "codigo": 1, "matriz": 0, "numero": "188", "padrao": 0, "inscest": "0963185373", "inscmun": null, "endereco": "Gaspar Martins", "codufibge": "43", "emailnome": "Nota Fiscal Treelux", "inscmunst": null, "logodados": null, "logofluxo": null, "emailporta": 587, "emailsenha": "treeluxdeccor", "impressora": null, "logovendas": null, "codpaisibge": "1058", "complemento": null, "fluxolinha1": "Baren Iluminação Eireli", "fluxolinha2": "Rua Gaspar Martins, 188", "fluxolinha3": "Fone: (51) 3062-3233 - Porto Alegre/RS", "fluxolinha4": "CNPJ: 08.917.340/0001-93", "fluxolinha5": null, "logocompras": null, "papelparede": null, "razaosocial": "Baren Iluminação Eireli", "codmunicipio": 4314902, "emailusuario": "deposito@treeluxbrazil.com.br", "nomefantasia": "Treelux Brasil", "vendaslinha1": "Baren Iluminação Eireli", "vendaslinha2": "Rua Gaspar Martins, 188", "vendaslinha3": "Fone: (51) 3062-3233 - Porto Alegre/RS", "vendaslinha4": "CNPJ: 08.917.340/0001-93", "vendaslinha5": "Vendedor:", "codigosuframa": null, "compraslinha1": "Baren Iluminação Eireli", "compraslinha2": "Rua Gaspar Martins, 188", "compraslinha3": "Fone: (51) 3062-3233 - Porto Alegre/RS", "compraslinha4": "CNPJ: 08.917.340/0001-93", "compraslinha5": null, "emailendereco": "deposito@treeluxbrazil.com.br", "emailservidor": "smtp.gmail.com", "listadeemails": "deposito@treeluxbrazil.com.br|correaasouza@gmail.com|antoniojr@zeta.com.br", "imgfundovendas": null, "tipologradouro": "Rua", "cnpjcertificado": "08917340000193", "regimetributario": 1, "papelparedelayout": 0, "habilitaspedfiscal": 0, "emailautenticacaossl": 1, "incentivadorcultural": 0, "codigonaturezajuridica": "0", "optantesimplesnacional": 1, "codigobasecalculocredito": 0, "habilitaefdcontribuicoes": 0, "regimeespecialtributacao": 1, "percentualsimplesnacional": 0, "regimeespecialtributacaogeral": 1, "percentualcreditoicmssimplesnacional": 0}}, {"id": 2, "code": "MEB Importadora Eireli", "profile": {"uf": "RS", "cep": "90220000", "fax": "(51) 30159689", "cnae": "4754703", "cnpj": "15113032000170", "fone": "(51) 30159689", "pais": "Brasil", "site": "www.treeluxbrasil.com.br", "email": "deposito@treeluxbrazil.com.br", "rntrc": null, "sigla": null, "bairro": "Floresta", "cidade": "Porto Alegre", "codigo": 2, "matriz": 0, "numero": "928", "padrao": 1, "inscest": "0963469347", "inscmun": null, "endereco": "Avenida Farrapos", "codufibge": "43", "emailnome": "Nota Fiscal MEB Importadora", "inscmunst": null, "logodados": null, "logofluxo": null, "emailporta": 587, "emailsenha": "treeluxdeccor", "impressora": null, "logovendas": null, "codpaisibge": "1058", "complemento": null, "fluxolinha1": "MEB Importadora Eireli", "fluxolinha2": "Rua João Abott, 52", "fluxolinha3": "Fone: (51) 3062-3233 - Porto Alegre/RS", "fluxolinha4": "CNPJ: 15.113.032/0001-70", "fluxolinha5": null, "logocompras": null, "papelparede": null, "razaosocial": "MEB Importadora Eireli", "codmunicipio": 4314902, "emailusuario": "deposito@treeluxbrazil.com.br", "nomefantasia": "MEB Importadora Eireli", "vendaslinha1": "MEB Importadora Eireli", "vendaslinha2": "Rua João Abott, 52", "vendaslinha3": "Fone: (51) 3062-3233 - Porto Alegre/RS", "vendaslinha4": "CNPJ: 15.113.032/0001-70", "vendaslinha5": "Vendedor:", "codigosuframa": null, "compraslinha1": "MEB Importadora Eireli", "compraslinha2": "Rua João Abott, 52", "compraslinha3": "Fone: (51) 3062-3233 - Porto Alegre/RS", "compraslinha4": "CNPJ: 15.113.032/0001-70", "compraslinha5": null, "emailendereco": "deposito@treeluxbrazil.com.br", "emailservidor": "smtp.gmail.com", "listadeemails": "deposito@treeluxbrazil.com.br|correaasouza@gmail.com", "imgfundovendas": null, "tipologradouro": null, "cnpjcertificado": "15113032000170", "regimetributario": 1, "papelparedelayout": 0, "habilitaspedfiscal": 0, "emailautenticacaossl": 1, "incentivadorcultural": 0, "codigonaturezajuridica": "1", "optantesimplesnacional": 1, "codigobasecalculocredito": 0, "habilitaefdcontribuicoes": 0, "regimeespecialtributacao": 1, "percentualsimplesnacional": 0, "regimeespecialtributacaogeral": 0, "percentualcreditoicmssimplesnacional": 0}}]}
      }
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 201);
      userHasResources = JSON.parse(body);
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
      url: `${BASE_URL}/api/services/${id}/entities/${prefix}ecli?filter[codfilial]=${codfilial}&fields=codcliente,nome,cpf_cgc,pessoa,codfilial`,
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

  /**
   *  Only works if access_token lifetime (server-side) is less than sleep function parameter
  it('Should get invalid_token (access_token has expired) from grant type authorization_code', function(done) {

    this.timeout(30000);
    function sleep (time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    sleep(6000).then(() => {
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

        var redirects = response.request._redirect.redirects;
        assert.equal(redirects[0].statusCode, 302);

        var queryParams = Url.parse(redirects[0].redirectUri, true).query;
        assert.equal(queryParams.error, 'invalid_token');

        done();
        this.timeout(2000);
      });
    });
  });
  **/

  it('Should REFRESH token generated by grant type AUTHORIZATION_CODE', function(done) {
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

  it('Should DELETE access token generated by authorization_code flow', function(done) {
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

  it('Should DELETE a resource (service)', function(done) {
    var request = {
      method: 'DELETE',
      url: BASE_URL + '/api/services/' + service.id
    };
    Request(request, function (error, response, body) {
      if (error) console.error(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('Should DELETE a users_has_resources relationship', function(done) {
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

  it('Should REFRESH token generated by grant type PASSWORD', function(done) {
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

  it('Should DELETE access token generated by grant type PASSWORD', function(done) {
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

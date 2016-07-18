var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
// var server = require('../app');
var server = 'http://localhost:80';
chai.use(chaiHttp);


describe('Oauth2-server FLOW', function() {
  var user;
  var client;

  //ADD
  it('should add a SINGLE user on /users POST', function(done) {
    chai.request(server)
    .post('/users')
    .send({'username': 'Javascript', 'password': 'rulezzzz', 'email': 'e@mail.com.ui'})
    .end(function(err, res) {
      // console.log(res.body);
      user = res.body;
      res.should.have.status(201);
      done();
    });
  });

  it('should add a SINGLE CLIENT on /clients POST', function(done) {
    chai.request(server)
    .post('/clients')
    .send({'redirect_uri': 'http://www.google.com'})
    .end(function(err, res) {
      // console.log(res);
      client = res.body;
      res.should.have.status(201);
      done();
    });
  });

  //AUTHORIZE
  it('shoud get bearer code with grant type "password"', function(done) {
    chai.request(server)
    .post('/oauth/token')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({grant_type: 'password', client_id: client.client_id, client_secret: client.client_secret, username: user.username, password: user.password})
    .end(function(error, response){
      console.log(response.body);
      done();
    });
  });

  /**
  it('should redirect with authentication on /oauth/authorize GET', function(done) {
    chai.request(server)
    .get('/oauth/authorize')
    .query({response_type: 'code', client_id: client.client_id, redirect_uri: client.redirect_uri})
    .end(function(err, res) {
      if(err) { console.log('err ', err); }

      var cookies = res.headers['set-cookie'].pop().split(';')[0];

      var seccondRequest = chai.request(server)
        .set('content-type', 'application/x-www-form-urlencoded')
        .post(res.redirects[0])
        .send({username: user.username , password: user.password });
      seccondRequest.cookies = cookies;
      seccondRequest.end(function(err, response){

        var thirdRequest = chai.request(server)
          .post(response.redirects[0])
          .send({username: user.username , password: user.password });
        thirdRequest.cookies = cookies;
        thirdRequest.end(function(err, response) {

          var fourthRequest = chai.request(server)
            .get('/oauth/authorize')
            .query({response_type: 'code', client_id: client.client_id, redirect_uri: client.redirect_uri});
          fourthRequest.cookies = cookies;
          fourthRequest.end(function(err, response) {
            console.log();
            response.should.have.status(200);
            done();
          });
        });
      });
    });
  });
  **/

  //DELETES
  it('should delete a SINGLE USER on /users/:id DELETE', function(done) {
    chai.request(server)
    .delete(`/users/${user.id}`)
    .end(function(error, response) {
      response.should.have.status(200);
      done();
    });
  });

  it('should delete a SINGLE CLIENT on /clients/:id DELETE', function(done) {
    chai.request(server)
    .delete(`/clients/${client.client_id}`)
    .end(function(error, response){
      response.should.have.status(200);
      done();
    });
  });

});

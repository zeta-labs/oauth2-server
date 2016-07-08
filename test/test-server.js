var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
// var server = require('../app');
var server = 'http://localhost:9990';
chai.use(chaiHttp);


describe('Oauth2-server FLOW', function() {
  var user;
  var client;

  //ADD
  it('should add a SINGLE user on /users POST', function(done) {
    chai.request(server)
    .post('/users')
    .send({'username': 'Javascript', 'password': 'rulezzzz', 'email': 'e@mail.com.ui'})
    .end(function(err, res){
      user = res.body;
      // console.log(res.body);
      res.should.have.status(201);
      done();
    });
  });

  it('should add a SINGLE CLIENT on /clients POST', function(done) {
    chai.request(server)
    .post('/clients')
    .send({'redirect_uri': 'http://www.oauthteste.com.br'})
    .end(function(err, res){
      client = res.body;
      // console.log(res);
      res.should.have.status(201);
      done();
    });
  });

  //AUTHORIZE
  it('should get authorization_code on /oauth/authorize GET', function(done) {
    chai.request(server)
    .get('/oauth/authorize')
    .query({response_type: 'code', client_id: client.client_id, redirect_uri: client.redirect_uri})
    .end(function(err, res){
      console.log('RES, ', res);
      expect(res).to.redirect;
      res.should.have.status(500);
    });
    done();
  });
  // it('should get authorization_code on /oauth/authorize GET', function(done) {
  //   chai.request(server)
  //     .get(`/oauth/authorize?  response_type=code&client_id=${client.client_id}&redirect_uri=${client.redirect_uri}`)
  //     .end(function(error, response) {
  //       response.should.have.status(304);
  //       done();
  //     });
  // });

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

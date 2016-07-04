var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);


describe('Blobs', function() {
  it('should list ALL blobs on /blobs GET');
  it('should list a SINGLE blob on /blob/<id> GET');
  it('should add a SINGLE user on /users POST', function(done) {
    chai.request(server)
    .post('/users')
    .send({'username': 'Java', 'password': 'Script'})
    .end(function(err, res){
      res.should.have.status(200);
      // res.should.be.json;
      // res.body.should.be.a('object');
      // res.body.should.have.property('status');
      // res.body.status.status.should.equal('success');
      done();
    });
  });
  it('should update a SINGLE blob on /blob/<id> PUT');
  it('should delete a SINGLE blob on /blob/<id> DELETE');
});

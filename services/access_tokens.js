'use strict'

var knex = require('knex')({
  client: 'pg',
  connection: 'postgres://postgres:postgres@localhost:5432/oauth'
});

class AccessTokenService{

  constructor(knex){
    this.knex = knex;
  }

  create(accessToken, callback){

    let error = error => callback(error);

    this.knex('access_tokens')
    .insert(accessToken)
    .then(rows => {
      callback(null, rows[0])
    })
    .catch(error);
  }

  find(accessToken,callback) {

    this.knex.select('*')
    .from('acces_tokens')
    .where(accessToken)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }
}

module.exports = new AccessTokenService(knex);

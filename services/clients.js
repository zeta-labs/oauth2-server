'use strict'

var knex = require('knex')({
  client: 'pg',
  connection: 'postgres://postgres:postgres@localhost:5432/oauth'
});

class ClientService{

  constructor(knex){
    this.knex = knex;
  }

  create(client, callback){
    
    let error = error => callback(error);

    this.knex('clients')
    .insert(client)
    .returning('*')
    .then(rows => {
      callback(null, rows[0])
    })
    .catch(error);
  }
}

module.exports = new ClientService(knex);

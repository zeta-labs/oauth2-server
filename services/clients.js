var pgConn = 'postgres://postgres:postgres@localhost:5432/oauth';
var pg = require('pg');
var knex = require('knex')({
  client: 'pg',
  connection: pgConn
});

exports.createClient = function(client,callback) {
  knex('clients')
    .insert(client)
    .returning('*')
    .then(function(data) {
      callback(null,data[0]);
    })
    .catch(function(err) {
      callback(error);
    });
};

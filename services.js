var pgConn = 'postgres://postgres:postgres@localhost:5432/oauth';
var pg = require('pg');
var knex = require('knex')({
  client: 'pg',
  connection: pgConn
});

exports.createClient = function(client,callback) {
  knex('clients')
    .insert({redirect_uri: client.redirect_uri})
    .returning('*')
    .then(function(data) {
      callback(null,data[0]);
    })
    .catch(function(err) {
      callback(error);
    });
};

exports.createUser = function(user, callback) {
  knex('users')
    .insert(user)
    .returning('*')
    .then(function(data) {
      callback(null,data[0]);
    })
    .catch(function(error) {
      callback(error);
    });
};

exports.getUser = function(user,callback) {
  knex.select('*')
    .from('users')
    .where(user)
    .then(function(data) {
      callback(null,data[0]);
    }).catch(function(error) {
      callback(error);
    });
};

var pgConn = 'postgres://postgres:postgres@localhost:5432/oauth';
var pg = require('pg');
var knex = require('knex')({
  client: 'pg',
  connection: pgConn
});

exports.create = function(user, callback) {
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

exports.get = function(user,callback) {
  knex.select('*')
    .from('users')
    .where(user)
    .then(function(data) {
      callback(null,data[0]);
    }).catch(function(error) {
      callback(error);
    });
};

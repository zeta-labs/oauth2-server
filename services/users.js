<<<<<<< HEAD
'use strict'

// var users = module.exports;
// let _ = require('lodash');
let validate = require('validate.js');
let knex = require('knex')({
  client: 'pg',
  connection: 'postgres://postgres:postgres@localhost:5432/oauth'
});

class UserService {

  constructor(knex, validate) {
    this.knex = knex;
    this.validate = validate;
    this.constraints = {
      create: {
        username: {
          presence: true,
          length: {
            minimum: 5,
            maximum: 30
          },
          format: {
            pattern: /^[A-Za-z0-9-_\^]{5,30}$/
          }
        },
        password: {
          presence: true,
          length: {
            minimum: 5,
            maximum: 30
          }
        }
      }
    };
  }

  create(data, callback) {

    let error = (error) => callback(error);

    this.validate.async(data, this.constraints)
    .then(user => {
      this.knex('users')
      .insert(user)
      .returning('*')
      .then(rows => {
        callback(null, rows[0]);
      })
      .catch(error);
    })
    .catch(error);
  }
}

module.exports = new UserService(knex, validate);
=======
var pgConn = 'postgres://postgres:postgres@localhost:5432/oauth';
var pg = require('pg');
var knex = require('knex')({
  client: 'pg',
  connection: pgConn
});

exports.create = function(user, callback) {
  knex('users')
    .insert(user)
    .returning(['id', 'username', 'email', 'active', 'created_at'])
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
>>>>>>> fd5e684348e1de27ac56f6dc70ca96ef1958fdda

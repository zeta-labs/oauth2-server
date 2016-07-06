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

  find(user,callback) {

    let error = error => callback(error);

    this.knex.select('*')
    .from('users')
    .where(user)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error);
  }

}

module.exports = new UserService(knex, validate);

'use strict'

let { UserService } = require('./users/');
// let { USER_CONSTRAINTS } = require('./users');

// var users = module.exports;
// let _ = require('lodash');
let validate = require('validate.js');
let knex = require('knex')({
  client: 'pg',
  connection: 'postgres://postgres:postgres@localhost:5432/oauth'
});

module.exports.users = new UserService(knex, validate);

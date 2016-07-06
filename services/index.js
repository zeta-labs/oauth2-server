'use strict'

// let { USER_CONSTRAINTS } = require('./users');
let { UserService } = require('./users/');
let { ClientService } = require('./clients/');
let { AccessTokensService } = require('./access-tokens/');
let { CodesService } = require('./codes/');


// let _ = require('lodash');
let validate = require('validate.js');
let knex = require('knex')({
  client: 'pg',
  connection: 'postgres://postgres:postgres@localhost:5432/oauth'
});

module.exports.users = new UserService(knex, validate);
module.exports.clients = new ClientService(knex);
module.exports.accessTokens = new AccessTokensService(knex);
module.exports.codes = new CodesService(knex);

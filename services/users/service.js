const CONSTRAINTS = require('./constraints');

let _ = require('lodash');

class UserService {

  constructor(knex, validatate) {
    this.knex = knex;
    this.validatate = validatate;
    this.constraints = CONSTRAINTS;
    knex('users').columnInfo().then(columns => {
      this.columns = columns;
    });
  }

  create(data, callback) {
    let error = (error) => {
      console.error(error);
      callback(error);
    }
    this.validatate
    .async(data, this.constraints.CREATE)
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

    this.knex.select('*')
    .from('users')
    .where(user)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }

  delete(id, callback) {

    this.knex('users')
    .where('id', id)
    .del()
    .then(isDeleted => {
      callback(null,isDeleted);
    })
    .catch(error => callback(error));
  }
}

module.exports = UserService;

const CONSTRAINTS = require('./constraints');

class UserService {

  constructor(knex, validate) {
    this.knex = knex;
    this.validate = validate;
    this.constraints = CONSTRAINTS;
  }

  create(data, callback) {

    let error = (error) => callback(error);

    this.validate.async(data, this.constraints.CREATE)
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
}

module.exports = UserService;

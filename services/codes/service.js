class CodesService{

  constructor(knex){
    this.knex = knex;
    this.TABLE_NAME = 'codes';
  }

  create(code, callback){
    let error = error => callback(error);

    this.knex(this.TABLE_NAME)
    .insert(code)
    .returning('*')
    .then(rows => {
      callback(null, rows[0])
    })
    .catch(error);
  }

  find(code,callback) {
    this.knex.select('*')
    .from(this.TABLE_NAME)
    .where(code)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }

  delete(code, callback) {
    this.knex(this.TABLE_NAME)
    .where('value', code)
    .del()
    .then(isDeleted => {
      callback(null,isDeleted);
    })
    .catch(error => callback(error));
  }
}

module.exports = CodesService;

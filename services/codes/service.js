class CodesService{

  constructor(knex){
    this.knex = knex;
  }

  create(code, callback){

    let error = error => callback(error);

    this.knex('codes')
    .insert(code)
    .returning('*')
    .then(rows => {
      callback(null, rows[0])
    })
    .catch(error);
  }

  find(code,callback) {

    this.knex.select('*')
    .from('codes')
    .where(code)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }
}

module.exports = CodesService;

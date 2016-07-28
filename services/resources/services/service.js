class ServicesService{

  constructor(knex){
    this.knex = knex;
    this.TABLE_NAME = 'services';
  }

  create(service, callback){
    let error = error => callback(error);

    this.knex(this.TABLE_NAME)
    .insert(service)
    .returning('*')
    .then(rows => {
      callback(null, rows[0])
    })
    .catch(error);
  }

  find(service,callback) {
    this.knex.select('*')
    .from(this.TABLE_NAME)
    .where(service)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }

  delete(id, callback) {
    this.knex(this.TABLE_NAME)
    .where('id', id)
    .del()
    .then(isDeleted => {
      callback(null,isDeleted);
    })
    .catch(error => callback(error));
  }
}

module.exports = ServicesService;

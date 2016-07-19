class ServicesService{

  constructor(knex){
    this.knex = knex;
  }

  create(service, callback){

    let error = error => callback(error);

    this.knex('services')
    .insert(service)
    .returning('*')
    .then(rows => {
      callback(null, rows[0])
    })
    .catch(error);
  }

  find(service,callback) {
    this.knex.select('*')
    .from('services')
    .where(service)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }

  delete(id, callback) {
    this.knex('services')
    .where('id', id)
    .del()
    .then(isDeleted => {
      callback(null,isDeleted);
    })
    .catch(error => callback(error));
  }
}

module.exports = ServicesService;

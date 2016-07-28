class ClientService{

  constructor(knex){
    this.knex = knex;
    this.TABLE_NAME = 'clients';
  }

  create(client, callback){
    let error = error => callback(error);

    this.knex(this.TABLE_NAME)
    .insert(client)
    .returning('*')
    .then(rows => {
      callback(null, rows[0])
    })
    .catch(error);
  }

  find(client,callback) {
    this.knex.select('*')
    .from(this.TABLE_NAME)
    .where(client)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }

  delete(clientId, callback) {
    this.knex(this.TABLE_NAME)
    .where('id', clientId || clientId.id)
    .del()
    .then(isDeleted => {
      callback(null,isDeleted);
    })
    .catch(error => callback(error));
  }
}

module.exports = ClientService;

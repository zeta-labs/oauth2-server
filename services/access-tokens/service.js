class AccessTokensService{

  constructor(knex){
    this.knex = knex;
  }

  create(accessToken, callback){

    let error = error => callback(error);
    console.log('accessToken ', accessToken);
    this.knex('access_tokens')
    .insert(accessToken)
    .returning('*')
    .then(rows => {
      callback(null, rows[0])
    })
    .catch(error);
  }

  find(accessToken,callback) {

    this.knex.select('*')
    .from('acces_tokens')
    .where(accessToken)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }
}

module.exports = AccessTokensService;

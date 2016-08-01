class AccessTokensService{

  constructor(knex){
    this.knex = knex;
  }

  create(accessToken, callback){
    let error = error => callback(error);

    this.knex('access_tokens')
    .insert(accessToken)
    .returning('*')
    .then(rows => {
      callback(null, rows[0]);
    })
    .catch(error);
  }

  find(accessToken, callback) {
    this.knex.select('*')
    .from('access_tokens')
    .where(accessToken)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }

  revokeRefreshToken(refreshToken, callback) {
    this.knex('access_tokens')
    .where('refresh_token', refreshToken)
    .del()
    .then(isDeleted => callback())
    .catch(error => callback(error));
  };

  deleteByValue(value, callback) {
    this.knex('access_tokens')
    .where('value', value)
    .del()
    .then(isDeleted => {
      callback(null,isDeleted);
    })
    .catch(error => callback(error));
  }
}

module.exports = AccessTokensService;

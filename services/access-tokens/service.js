class AccessTokensService{

  constructor(knex){
    this.knex = knex;
    this.TABLE = 'access_tokens';
  }

  create(accessToken, callback){
    let error = error => callback(error);

    this.knex(this.TABLE)
    .insert(accessToken)
    .returning('*')
    .then(rows => {
      callback(null, rows[0]);
    })
    .catch(error);
  }

  find(accessToken, callback) {
    this.knex.select('*')
    .from(this.TABLE)
    .where(accessToken)
    .then(rows => {
      callback(null,rows[0]);
    })
    .catch(error => callback(error));
  }

  revokeRefreshToken(refreshToken, callback) {
    this.knex(this.TABLE)
    .where('refresh_token', refreshToken)
    .del()
    .then(isDeleted => callback())
    .catch(error => callback(error));
  };

  deleteByValue(value, callback) {
    this.knex(this.TABLE)
    .where('value', value)
    .del()
    .then(isDeleted => {
      callback(null,isDeleted);
    })
    .catch(error => callback(error));
  }
}

module.exports = AccessTokensService;

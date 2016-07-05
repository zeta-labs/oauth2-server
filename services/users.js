var users = module.exports;
var _ = require('lodash');
var knex = require('knex')({
  client: 'pg',
  connection: 'postgres://postgres:postgres@localhost:5432/oau89th'
});


// users.printAll = function(){
//   knex.select().from('users').then(function(users) {
//     console.log(users);
//   });
// };

knex('users').insert({username: 'username', password: 'password'})
.then(function(resp) {
  console.log('resp ',resp);
})
.catch(function(err) {
  console.error('err ',err);
});

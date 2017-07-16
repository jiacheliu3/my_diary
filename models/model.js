//new ORM
var Sequelize = require ("sequelize");
var sequelize = new Sequelize('pj1', 'admin', 'password', {
  host: 'aas-productdb.cyfpo3kil8km.us-east-1.rds.amazonaws.com',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

});
sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

var query_prompt = sequelize.define('user', { });

module.exports = {
//        user: require ("./user.js")(sequelize,Sequelize),
//        history: require ("./history.js")(sequelize,Sequelize),
        product: require ("./product.js")(sequelize,Sequelize),
//        address: require ("./address.js")(sequelize,Sequelize),
//        user_account: require ("./user_account.js")(sequelize,Sequelize)
    };

const {Sequelize} = require('sequelize');

const sequelize= new Sequelize("encuesta_db", "root", "1234" , {
    host: "localhost",
    dialect: "mysql",
    logging: true,

});
module.exports = sequelize;



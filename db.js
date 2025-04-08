const {Sequelize} = require('sequelize');
require('dotenv').config();

const sequelize= new Sequelize(
    process.env.DB_NAME || "encuenta_db",
    process.env.DB_USER || "root",
    process.env.DB_PASS || "1234",
    {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: true,

});
module.exports = sequelize;



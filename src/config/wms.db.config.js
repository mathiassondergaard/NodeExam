const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.RESOURCE_DB_DB, process.env.RESOURCE_DB_USER, process.env.RESOURCE_DB_PW, {
    host: process.env.RESOURCE_DB_HOST,
    port: process.env.RESOURCE_DBL_PORT,
    dialect: process.env.RESOURCE_DB_DIALECT,
    operatorsAliases: 0,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const db = {};
db.sequelize = sequelize;
db.dataTypes = Sequelize;

module.exports = db;

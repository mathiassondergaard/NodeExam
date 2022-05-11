const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.WMS_DB_DB, process.env.WMS_DB_USER, process.env.WMS_DB_PW, {
    host: process.env.WMS_DB_HOST,
    port: process.env.WMS_DB_PORT,
    dialect: process.env.WMS_DB_DIALECT,
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
db.Sequelize = Sequelize;

module.exports = db;
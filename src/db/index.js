const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.WMS_DB_DB, process.env.WMS_DB_USER, process.env.WMS_DB_PW, {
    host: process.env.WMS_DB_HOST,
    port: process.env.WMS_DB_PORT,
    dialect: process.env.WMS_DB_DIALECT,
    dialectOptions:{useUTC:false},
    timezone:"+02:00",
    operatorsAliases: 0,
    define: {
        timestamps: false
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false,
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;
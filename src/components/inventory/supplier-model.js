const db = require('../../db');

const Supplier = db.sequelize.define('suppliers', {
    name: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Name cannot be empty'
            },
        },
    },
    email: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Email cannot be empty!'
            },
        },
    },
    phone: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Phone number cannot be empty!'
            },
        },
    },
})
const db = require('../../db');

const Employee = db.sequelize.define('employees', {
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
    title: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Title cannot be empty!'
            },
        },
    },
});

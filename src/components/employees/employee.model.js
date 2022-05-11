const db = require('../../db');

const Employee = db.sequelize.define('employees', {
    name: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Name cannot be empty'
            },
        },
    },
    email: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Email cannot be empty!'
            },
        },
    },
    phone: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Phone number cannot be empty!'
            },
        },
    },
    title: {
        type: db.Sequelize.ENUM('Worker', 'Supervisor', 'Manager'),
        defaultValue: 'Worker',
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Status cannot be empty!'
            },
        },
    },
});

module.exports = Employee;


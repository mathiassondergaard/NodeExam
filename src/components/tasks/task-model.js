const db = require('../../db');

const Task = db.sequelize.define('tasks', {
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
    description: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Description cannot be empty!'
            },
        },
    },
    level: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Description cannot be empty!'
            },
        },
    },
    status: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Description cannot be empty!'
            },
        },
    },
});


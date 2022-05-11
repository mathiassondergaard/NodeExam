const db = require('../../db');

const Product = db.sequelize.define('products', {
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
    SKU: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'SKU cannot be empty!'
            },
        },
    },
    stock: {
        type: db.dataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                args: true,
                msg: 'Stock must be a number!'
            },
            notEmpty: {
                args: true,
                msg: 'Stock cannot be empty!'
            },
            min: {
                args: [0],
                msg: 'Stock cannot be below zero!',
            },
        },
    },
    status: {
        type: db.dataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                args: true,
                msg: 'Stock must be a number!'
            },
            notEmpty: {
                args: true,
                msg: 'Stock cannot be empty!'
            },
            min: {
                args: [0],
                msg: 'Stock cannot be below zero!',
            },
        },
    },
})
const db = require('../../db');

const Address = db.sequelize.define('addresses', {
    street: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Address cannot be empty!'
            },
        },
    },
    city: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'City cannot be empty!'
            },
        },
    },
    zip: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Zip cannot be empty!'
            }
        },
    },
    country: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Country cannot be empty!'
            }
        },
    },
});

module.exports = Address;


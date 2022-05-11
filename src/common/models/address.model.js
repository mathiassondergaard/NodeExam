const db = require('../../db');

exports.address = (sequelize, Sequelize) => {
    const Address = sequelize.define('addresses', {
        address: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Address cannot be empty!'
                },
            },
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'City cannot be empty!'
                },
            },
        },
        zip: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Zip cannot be empty!'
                }
            },
        },
        country: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Country cannot be empty!'
                }
            },
        },
    });
    return Address;
}



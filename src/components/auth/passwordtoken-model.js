const db = require('../../db');
const {User} = require('./user-model');

const PasswordToken = db.sequelize.define('password_tokens', {
    token: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Token cannot be empty'
            },
        },
    },
    expiryDate: {
        type: db.Sequelize.DATE,
        allowNull: false,
        validate: {
            isDate: {
                args: true,
                msg: 'Expiry date must be a date!'
            },
            notEmpty: {
                args: true,
                msg: 'Description cannot be empty!'
            },
        },
    },
});

PasswordToken.hasOne(User, {
    as: 'user',
    foreignKey: 'user_id',
    onDelete: 'RESTRICT',
});

module.exports = {
    PasswordToken
};

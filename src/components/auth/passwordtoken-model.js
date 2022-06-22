const db = require('../../db');

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

PasswordToken.belongsTo(db.sequelize.models.users, {
    as: 'user',
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
});

module.exports = PasswordToken;

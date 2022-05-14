const db = require('../../db');
const {Role} = require('./role-model');
const {Employee} = require('../employees');

const User = db.sequelize.define('users', {
    username: {
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
                msg: 'Description cannot be empty!'
            },
        },
    },
    password: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Description cannot be empty!'
            },
        },
    },
});

User.hasMany(Role, {
    through: 'user_roles',
    as: 'roles',
    foreignKey: 'user_id'
});

Role.hasMany(User, {
    through: 'user_roles',
    as: 'roles',
    foreignKey: 'role_id'
})

User.belongsTo(Employee, {
    as: 'employee',
    foreignKey: 'employee_id',
    onDelete: 'RESTRICT',
});

module.exports = {
    User
};


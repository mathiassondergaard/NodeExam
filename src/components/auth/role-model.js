const db = require('../../db');

const Role = db.sequelize.define('roles', {
    role: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Role cannot be empty'
            },
        },
    },
});

module.exports = Role;


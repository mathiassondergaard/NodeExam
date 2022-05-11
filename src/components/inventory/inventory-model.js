const db = require('../../db');

const Inventory = db.sequelize.define('inventory', {
    location: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Location cannot be empty'
            },
        },
    },
})
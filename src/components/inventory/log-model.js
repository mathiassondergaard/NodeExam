const db = require("../../db");

const ItemLog = db.sequelize.define("items_log", {
    SKU: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: "SKU cannot be empty!",
            },
        },
    },
    employeeId: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                args: true,
                msg: "Employee id must be a number!",
            },
            notEmpty: {
                args: true,
                msg: "Employee id cannot be empty!",
            },
        },
    },
    quantityChanged: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: "Quantity changed cannot be empty!",
            },
        },
    },
    note: {
        type: db.Sequelize.STRING,
        allowNull: true,
        validate: {
            len: {
                args: [0,200],
                msg: "Note cannot be larger than 200 characters"
            }
        },
    },
});

module.exports = ItemLog;

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
    userId: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                args: true,
                msg: "Stock must be a number!",
            },
            notEmpty: {
                args: true,
                msg: "Stock cannot be empty!",
            },
            min: {
                args: [0],
                msg: "Stock cannot be below zero!",
            },
        },
    },
    quantityChanged: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: "Quantity changed cannot be empty!",
            },
            isInt: {
                args: true,
                msg: "Quantity changed must be a number!",
            },
        },
    },
    note: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: "Note cannot be empty",
            },
            max: {
                args: 200,
                msg: "Note cannot be longer than 200 characters!",
            },
        },
    },
});

module.exports = ItemLog;

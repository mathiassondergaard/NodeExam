const db = require("../../db");

const Item = db.sequelize.define("items", {
    name: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: "Name cannot be empty",
            },
        },
    },
    SKU: {
        type: db.Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                args: true,
                msg: "SKU cannot be empty!",
            },
        },
    },
    stock: {
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
    status: {
        type: db.Sequelize.ENUM("HEALTHY", "CAUTION", "CRITICAL"),
        defaultValue: "HEALTHY",
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: "Status cannot be empty!",
            },
        },
    },
    threshold: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                args: true,
                msg: "Threshold must be a number!",
            },
            notEmpty: {
                args: true,
                msg: "Threshold cannot be empty!",
            },
            min: {
                args: [0],
                msg: "Threshold cannot be below zero!",
            },
        },
    },
    location: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: "Location cannot be empty",
            },
        },
    },
    lastUpdatedBy: {
        type: db.Sequelize.INTEGER,
        allowNull: true,
        validate: {
            isInt: {
                args: true,
                msg: "LastUpdatedBy must be a number!",
            },
        },
    },
});

module.exports = Item;

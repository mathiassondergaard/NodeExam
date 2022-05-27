const db = require("../../db");

const BatchLog = db.sequelize.define("batch_logs", {
    affectedItemsSKUs: {
        type: db.Sequelize.ARRAY(db.Sequelize.STRING),
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

module.exports = BatchLog;

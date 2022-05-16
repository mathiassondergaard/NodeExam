const db = require('../../db');
const {Employee} = require('../../components/employees');

const Task = db.sequelize.define('tasks', {
    name: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Name cannot be empty'
            },
        },
    },
    description: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Description cannot be empty!'
            },
        },
    },
    assignee: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Assignee cannot be empty!'
            },
        },
    },
    level: {
        type: db.Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
        defaultValue: 'LOW',
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Level cannot be empty!'
            },
        },
    },
    status: {
        type: db.Sequelize.ENUM('NOT-STARTED', 'ON-GOING', 'POSTPONED', 'COMPLETED'),
        defaultValue: 'NOT-STARTED',
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Status cannot be empty!'
            },
        },
    },
    startedAt: {
        type: db.Sequelize.DATE,
        allowNull: true,
        validate: {
            isDate: {
                args: true,
                msg: 'Started at must be a date!'
            },
        },
    },
    completedAt: {
        type: db.Sequelize.DATE,
        allowNull: true,
        validate: {
            isDate: {
                args: true,
                msg: 'Started at must be a date!'
            },
        },
    },
});

Task.belongsToMany(db.sequelize.models.employees, {
    through: 'task_assigned_employees',
    as: 'assignedEmployees',
    foreignKey: 'task_id'
});

Employee.belongsToMany(Task, {
    through: 'task_assigned_employees',
    as: 'tasks',
    foreignKey: 'employee_id'
})

module.exports = Task;

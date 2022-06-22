const {logger} = require('../../common/log');
const Task = require('./task-model');
const db = require('../../db');
const {QueryTypes} = db.sequelize;
const {AppError} = require('../../error');

const moduleName = 'task-repository.js -';

exports.create = async (task) => {
    const _task = await Task.create({
        name: task.name,
        description: task.description,
        assignee: task.assignee,
        level: task.level,
    });

    if (_task[0] === 0) {
        logger.error(`${moduleName} could not create task`);
        throw new AppError(`Create task failed`, 500, true);
    }

    await _task.setAssignedEmployees(task.assignedEmployees)

    logger.debug(`${moduleName} created task ${JSON.stringify(_task)}`);
    return Task.findByPk(_task.id, {
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        }],
    });
};

exports.findAll = async () => {
    const tasks = await Task.findAll({
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
    });

    if (!tasks || tasks.length === 0) {
        logger.error(`${moduleName} no tasks present in db / db error`);
        throw new AppError('No tasks present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all tasks successfully`);

    return tasks.map(task => task.get({plain: true}));
};

exports.findAllByAssignee = async (assignee) => {
    const tasks = await Task.findAll({
        where: {
            assignee: assignee
        },
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
    });

    if (!tasks || tasks.length === 0) {
        logger.error(`${moduleName} no tasks present by ${assignee} in db / db error`);
        throw new AppError(`No tasks present by ${assignee} in DB!`, 404, true);
    }

    logger.debug(`${moduleName} found all tasks successfully by assignee ${assignee}`);

    return tasks.map(task => task.get({plain: true}));
};

exports.update = async (taskToUpdate) => {
    const foundTask = await Task.findByPk(taskToUpdate.id, {});

    const _task = await Task.update({
        name: taskToUpdate.name,
        description: taskToUpdate.description,
        level: taskToUpdate.level,
        status: taskToUpdate.status,
        startedAt: taskToUpdate.startedAt,
        completedAt: taskToUpdate.completedAt,
    }, {
        where: {
            id: taskToUpdate.id
        },
    });

    if (!_task || _task[0] === 0 || !foundTask) {
        logger.error(`${moduleName} task to update not found id: ${taskToUpdate.id} / db error`);
        throw new AppError(`Task ${taskToUpdate.id} not found!`, 404, true);
    }


    await foundTask.setAssignedEmployees(taskToUpdate.assignedEmployees)

    logger.debug(`${moduleName} updated task, id ${taskToUpdate.id}: ${JSON.stringify(_task)}`);

    return Task.findByPk(taskToUpdate.id, {
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        }],
    });
};

exports.findById = async (id) => {
    const task = await Task.findByPk(id, {
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
    });

    if (!task) {
        logger.error(`${moduleName} task ${id} not present in db / db error`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved task by id: ${id} | ${JSON.stringify(task)}`);
    return task.get({plain: true});
};

exports.findAssigneeById = async (id) => {
    const assignee = await Task.findByPk(id, {
        attributes: ['assignee'],
    });

    if (!assignee) {
        logger.error(`${moduleName} assignee belonging to task ${id} not present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} retrieved task assignee by id: ${id} | ${JSON.stringify(assignee)}`);
    return assignee.get({plain: true}).assignee;
};

exports.findAllByEmployeeId = async (employeeId) => {
    const query = `SELECT task_id FROM task_assigned_employees WHERE employee_id = ${employeeId}`;

    const tasksToFind = await db.sequelize.query(query, { type: QueryTypes.SELECT });
    if (!tasksToFind) {
        logger.error(`${moduleName} tasks by employee id ${employeeId} not present in db / db error`);
        throw new AppError(`Task by employee id ${employeeId} not found!`, 404, true);
    }

    const tasks = await Task.findAll({
        where: {
            id: tasksToFind.map(task => task.task_id)
        },
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name'],
        },
        ],
    });

    if (!tasks || tasks.length === 0) {
        logger.error(`${moduleName} tasks by employee id ${employeeId} not present in db / db error`);
        throw new AppError(`Task by employee id ${employeeId} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved task by employee id ${employeeId}`);
    return tasks.map(task => task.get({plain: true}));
};

exports.checkIfEmployeeIsAssignedToTask = async (id, employeeId) => {
    const query = `SELECT task_id FROM task_assigned_employees WHERE task_id = ${id} AND employee_id = ${employeeId}`;

    const isEmployeeAssigned = await db.sequelize.query(query, { type: QueryTypes.SELECT });

    if (!isEmployeeAssigned) {
        logger.error(`${moduleName} employee is not assigned to task ${id} employee ${employeeId}`);
        return false;
    }

    return true;
};

exports.updateStatus = async (taskToUpdate) => {
    const task = await Task.update({
        status: taskToUpdate.status,
    }, {
        where: {
            id: taskToUpdate.id
        }
    });

    if (!task || task[0] === 0) {
        logger.error(`${moduleName} task to update status not found id: ${taskToUpdate.id}`);
        throw new AppError(`Task ${taskToUpdate.id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task status with id ${taskToUpdate.id}: ${JSON.stringify(taskToUpdate.status)}`);
    return {message: `Task ${taskToUpdate.id} status successfully updated! New status: ${taskToUpdate.status}`};
};

exports.startTask = async (taskToUpdate) => {
    const task = await Task.update({
        status: 'ON-GOING',
        startedAt: taskToUpdate.date,
    }, {
        where: {
            id: taskToUpdate.id
        }
    });

    if (!task || task[0] === 0) {
        logger.error(`${moduleName} task to start not found id: ${taskToUpdate.id}`);
        throw new AppError(`Task ${taskToUpdate.id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} started task with id ${taskToUpdate.id}: ${JSON.stringify(taskToUpdate.date)}`);
    return `Task ${taskToUpdate.id} successfully started! Date: ${taskToUpdate.date}`;
};

exports.completeTask = async (taskToUpdate) => {
    const task = await Task.update({
        status: 'COMPLETED',
        completedAt: taskToUpdate.date,
    }, {
        where: {
            id: taskToUpdate.id
        }
    });

    if (!task || task[0] === 0) {
        logger.error(`${moduleName} task to complete not found id: ${taskToUpdate.id}`);
        throw new AppError(`Task ${taskToUpdate.id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} completed task with id ${taskToUpdate.id}: ${JSON.stringify(taskToUpdate.date)}`);
    return `Task ${taskToUpdate.id} successfully completed! Date: ${taskToUpdate.date}`;
};

exports.updateLevel = async (taskToUpdate) => {
    const task = await Task.update({
        level: taskToUpdate.level,
    }, {
        where: {
            id: taskToUpdate.id
        }
    });

    if (!task || task[0] === 0) {
        logger.error(`${moduleName} task to update level not found id: ${taskToUpdate.id}`);
        throw new AppError(`Task ${taskToUpdate.id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task level with id ${taskToUpdate.id}: ${JSON.stringify(taskToUpdate.level)}`);
    return {message: `Task ${taskToUpdate.id} level successfully updated! New level: ${taskToUpdate.level}`};
};

exports.delete = async (id) => {
    const deleted = await Task.destroy({
        where: {
            id: id
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} task to delete not found id: ${id}`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete task success, id: ${id}`);
    return {message: `Task ${id} successfully deleted!`};
};

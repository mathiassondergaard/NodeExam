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

    return true;
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

exports.update = async (id, task) => {
    const _task = await Task.update({
        name: task.name,
        description: task.description,
        level: task.level,
        status: task.status,
    }, {
        where: {
            id: id
        },
    });

    if (!_task || _task[0] === 0) {
        logger.error(`${moduleName} task to update not found id: ${id} / db error`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task, id ${id}: ${JSON.stringify(_task)}`);
    return {message: `Task ${id} successfully updated!`};
};

exports.updateAssignedEmployees = async (id, assignedEmployees) => {
    const task = await Task.findByPk(id,{});
    const updated = await task.setAssignedEmployees(assignedEmployees);

    if (!task || !updated || updated[0] === 0) {
        logger.error(`${moduleName} Task ${id} not present in db / db error`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task assigned employees: ${id} | new employees ${JSON.stringify(assignedEmployees)}`);
    return {message: 'Successfully updated task assigned employees!'};
}

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

exports.updateStatus = async (id, status) => {
    const task = await Task.update({
        status: status,
    }, {
        where: {
            id: id
        }
    });

    if (!task || task[0] === 0) {
        logger.error(`${moduleName} task to update status not found id: ${id}`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task status with id ${id}: ${JSON.stringify(status)}`);
    return {message: `Task ${id} status successfully updated! New status: ${status}`};
};

exports.updateLevel = async (id, level) => {
    const task = await Task.update({
        level: level,
    }, {
        where: {
            id: id
        }
    });

    if (!task || task[0] === 0) {
        logger.error(`${moduleName} task to update level not found id: ${id}`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task level with id ${id}: ${JSON.stringify(level)}`);
    return {message: `Task ${id} level successfully updated! New level: ${level}`};
};

exports.updateCompletedAt = async (id, date) => {
    const task = await Task.update({
        completedAt: date,
    }, {
        where: {
            id: id
        }
    });

    if (!task || task[0] === 0) {
        logger.error(`${moduleName} task to update completed at not found id: ${id}`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task completed at with id ${id}: ${JSON.stringify(date)}`);
    return {message: `Task ${id} completed at successfully updated! New date: ${date}`};
};

exports.updateStartedAt = async (id, date) => {
    const task = await Task.update({
        startedAt: date,
    }, {
        where: {
            id: id
        }
    });

    if (!task || task[0] === 0) {
        logger.error(`${moduleName} task to update started at not found id: ${id}`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task started at with id ${id}: ${JSON.stringify(date)}`);
    return {message: `Task ${id} started at successfully updated! New date: ${date}`};
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

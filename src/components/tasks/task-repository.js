const {logger} = require('../../common/log');
const {Task} = require('./task-model');
const {AppError} = require('../../error');

const moduleName = 'task-repository.js -';

exports.create = async (task) => {
    const _task = await Task.create({
        name: task.name,
        description: task.description,
        assignee: task.assignee,
        level: task.level,
        assignedEmployees: task.assignedEmployees
    }, {
        include: 'assignedEmployees'
    });

    if (_task[0] === 0) {
        logger.error(`${moduleName} could not create task`);
        throw new AppError(`Create task failed`, 500, true);
    }

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
        nested: true,
    });

    if (!tasks || tasks.length === 0) {
        logger.error(`${moduleName} no tasks present in db / db error`);
        throw new AppError('No tasks present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all tasks successfully`);

    return tasks;
};

exports.findAllByAssignee = async (assignee) => {
    const tasks = await Task.findAll({
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
        nested: true,
    }, {
        where: {
            assignee: assignee
        },
    });

    if (!tasks || tasks.length === 0) {
        logger.error(`${moduleName} no tasks present by ${assignee} in db / db error`);
        throw new AppError(`No tasks present by ${assignee} in DB!`, 404, true);
    }

    logger.debug(`${moduleName} found all tasks successfully by assignee ${assignee}`);

    return tasks;
};

exports.update = async (id, task) => {
    const _task = await Task.update({
        name: task.name,
        description: task.description,
        assignee: task.assignee,
        level: task.level,
        status: task.status,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        assignedEmployees: task.assignedEmployees,
    }, {
        include: 'assignedEmployees',
    }, {
        where: {
            id: id
        }
    });

    if (!_task || _task[0] === 0) {
        logger.error(`${moduleName} task to update not found id: ${id} / db error`);
        throw new AppError(`Task ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated task, id ${id}: ${JSON.stringify(_task)}`);
    return {message: `Task ${id} successfully updated!`};
};

exports.findById = async (id) => {
    const task = await Task.findByPk(id, {
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
        nested: true,
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
        return null;
    }

    logger.debug(`${moduleName} retrieved task assignee by id: ${id} | ${JSON.stringify(task)}`);
    return assignee.get({plain: true}).assignee;
};

exports.findAllByEmployeeId = async (employeeId) => {
    const tasks = await Task.findAll({
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
        nested: true,
    }, {
        through: { where: { employeeId: employeeId }},
    });

    if (!tasks) {
        logger.error(`${moduleName} tasks by employee id ${employeeId} not present in db / db error`);
        throw new AppError(`Task by employee id ${employeeId} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved task by employee id ${employeeId}`);
    return tasks;
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

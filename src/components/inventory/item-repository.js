const {logger} = require('../../common/log');
const Item = require('./item-model');
const {AppError} = require('../../error');

const moduleName = 'item-repository.js -';

exports.create = async (item) => {
    const _item = await Item.create({
        name: item.name,
        description: item.description,
        assignee: item.assignee,
        level: item.level,
    });

    if (_item[0] === 0) {
        logger.error(`${moduleName} could not create item`);
        throw new AppError(`Create item failed`, 500, true);
    }

    await _item.setAssignedEmployees(item.assignedEmployees)
    logger.debug(`${moduleName} created item ${JSON.stringify(_item)}`);

    return true;
};

exports.findAll = async () => {
    const items = await Item.findAll({
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
    });

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present in db / db error`);
        throw new AppError('No items present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all items successfully`);

    return items.map(item => item.get({plain: true}));
};

exports.findAllByAssignee = async (assignee) => {
    const items = await Item.findAll({
        where: {
            assignee: assignee
        },
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
    });

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present by ${assignee} in db / db error`);
        throw new AppError(`No items present by ${assignee} in DB!`, 404, true);
    }

    logger.debug(`${moduleName} found all items successfully by assignee ${assignee}`);

    return items.map(item => item.get({plain: true}));
};

exports.update = async (id, item) => {
    const _item = await Item.update({
        name: item.name,
        description: item.description,
        level: item.level,
        status: item.status,
    }, {
        where: {
            id: id
        },
    });

    if (!_item || _item[0] === 0) {
        logger.error(`${moduleName} item to update not found id: ${id} / db error`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item, id ${id}: ${JSON.stringify(_item)}`);
    return {message: `Item ${id} successfully updated!`};
};

exports.updateAssignedEmployees = async (id, assignedEmployees) => {
    const item = await Item.findByPk(id,{});
    const updated = await item.setAssignedEmployees(assignedEmployees);

    if (!item || !updated || updated[0] === 0) {
        logger.error(`${moduleName} Item ${id} not present in db / db error`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item assigned employees: ${id} | new employees ${JSON.stringify(assignedEmployees)}`);
    return {message: 'Successfully updated item assigned employees!'};
}

exports.findById = async (id) => {
    const item = await Item.findByPk(id, {
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name']
        },
        ],
    });

    if (!item) {
        logger.error(`${moduleName} item ${id} not present in db / db error`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved item by id: ${id} | ${JSON.stringify(item)}`);
    return item.get({plain: true});
};

exports.findAssigneeById = async (id) => {
    const assignee = await Item.findByPk(id, {
        attributes: ['assignee'],
    });

    if (!assignee) {
        logger.error(`${moduleName} assignee belonging to item ${id} not present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} retrieved item assignee by id: ${id} | ${JSON.stringify(assignee)}`);
    return assignee.get({plain: true}).assignee;
};

exports.findAllByEmployeeId = async (employeeId) => {
    const query = `SELECT item_id FROM item_assigned_employees WHERE employee_id = ${employeeId}`;

    const itemsToFind = await db.sequelize.query(query, { type: QueryTypes.SELECT });
    if (!itemsToFind) {
        logger.error(`${moduleName} items by employee id ${employeeId} not present in db / db error`);
        throw new AppError(`Item by employee id ${employeeId} not found!`, 404, true);
    }

    const items = await Item.findAll({
        where: {
            id: itemsToFind.map(item => item.item_id)
        },
        include: [{
            association: 'assignedEmployees',
            attributes: ['id', 'name'],
        },
        ],
    });

    if (!items || items.length === 0) {
        logger.error(`${moduleName} items by employee id ${employeeId} not present in db / db error`);
        throw new AppError(`Item by employee id ${employeeId} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved item by employee id ${employeeId}`);
    return items.map(item => item.get({plain: true}));
};

exports.checkIfEmployeeIsAssignedToItem = async (id, employeeId) => {
    const query = `SELECT item_id FROM item_assigned_employees WHERE item_id = ${id} AND employee_id = ${employeeId}`;

    const isEmployeeAssigned = await db.sequelize.query(query, { type: QueryTypes.SELECT });

    if (!isEmployeeAssigned) {
        logger.error(`${moduleName} employee is not assigned to item ${id} employee ${employeeId}`);
        return false;
    }

    return true;
};

exports.updateStatus = async (id, status) => {
    const item = await Item.update({
        status: status,
    }, {
        where: {
            id: id
        }
    });

    if (!item || item[0] === 0) {
        logger.error(`${moduleName} item to update status not found id: ${id}`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item status with id ${id}: ${JSON.stringify(status)}`);
    return {message: `Item ${id} status successfully updated! New status: ${status}`};
};

exports.updateLevel = async (id, level) => {
    const item = await Item.update({
        level: level,
    }, {
        where: {
            id: id
        }
    });

    if (!item || item[0] === 0) {
        logger.error(`${moduleName} item to update level not found id: ${id}`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item level with id ${id}: ${JSON.stringify(level)}`);
    return {message: `Item ${id} level successfully updated! New level: ${level}`};
};

exports.updateCompletedAt = async (id, date) => {
    const item = await Item.update({
        completedAt: date,
    }, {
        where: {
            id: id
        }
    });

    if (!item || item[0] === 0) {
        logger.error(`${moduleName} item to update completed at not found id: ${id}`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item completed at with id ${id}: ${JSON.stringify(date)}`);
    return {message: `Item ${id} completed at successfully updated! New date: ${date}`};
};

exports.updateStartedAt = async (id, date) => {
    const item = await Item.update({
        startedAt: date,
    }, {
        where: {
            id: id
        }
    });

    if (!item || item[0] === 0) {
        logger.error(`${moduleName} item to update started at not found id: ${id}`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item started at with id ${id}: ${JSON.stringify(date)}`);
    return {message: `Item ${id} started at successfully updated! New date: ${date}`};
};

exports.delete = async (id) => {
    const deleted = await Item.destroy({
        where: {
            id: id
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} item to delete not found id: ${id}`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete item success, id: ${id}`);
    return {message: `Item ${id} successfully deleted!`};
};

const {logger} = require('../../common/log');
const {Employee} = require('./employee-model');
const {Address} = require('../../common/models');
const {AppError} = require('../../error');

const moduleName = 'employee-repository.js -';

exports.create = async (employee, transaction) => {
    const _employee = await Employee.create({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        title: employee.title,
        address: employee.address
    }, {
        include: [Address],
        transaction
    });

    if (_employee[0] === 0) {
        logger.error(`${moduleName} could not create employee`);
        return;
    }

    logger.debug(`${moduleName} created employee ${JSON.stringify(_employee)}`);

    return employee.get({plain: true});
};

exports.findAll = async () => {
    const employees = await Employee.findAll({});

    if (!employees || employees.length === 0) {
        logger.error(`${moduleName} no employees present in db / db error`);
        throw new AppError('No employees present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all employees successfully`);

    return employees;
};

exports.findMultipleByIds = async (ids) => {
    const employees = await Employee.findAll({
        where: {
            id: ids,
        }
    });

    if (!employees || employees.length === 0) {
        logger.error(`${moduleName} no employees with ids ${ids} present in db / db error`);
        throw new AppError('No employees present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all employees by ids ${ids} successfully`);

    return employees;
};

exports.update = async (id, employee) => {
    const _employee = await Employee.update({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        title: employee.title,
        address: employee.address
    }, {
        include: [Address]
    }, {
        where: {
            id: id
        }
    });

    if (!_employee || _employee[0] === 0) {
        logger.error(`${moduleName} employee to update not found id: ${id} / db error`);
        throw new AppError(`Employee ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated employee, id ${id}: ${JSON.stringify(_employee)}`);
    return {message: `Employee ${id} successfully updated!`};
};

exports.findById = async (id) => {
    const employee = await Employee.findByPk(id, {
        include: [{
            model: Address,
            as: 'address',
            attributes: ['address', 'city', 'zip', 'country']
        },
        ],
    });

    if (!employee) {
        logger.error(`${moduleName} employee ${id} not present in db / db error`);
        throw new AppError(`Employee ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved employee by id: ${id} | ${JSON.stringify(employee)}`);
    return employee.get({plain: true});
};

exports.delete = async (id) => {
    const deleted = await Employee.destroy({
        where: {
            id: id
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} employee to delete not found id: ${id}`);
        throw new AppError(`Employee ${id} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete employee success, id: ${id}`);
    return {message: `Employee ${id} successfully deleted!`};
};

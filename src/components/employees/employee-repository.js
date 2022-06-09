const {logger} = require('../../common/log');
const Employee = require('./employee-model');
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
        include: 'address',
        transaction
    });

    if (_employee[0] === 0) {
        logger.error(`${moduleName} could not create employee`);
        return;
    }

    logger.debug(`${moduleName} created employee ${JSON.stringify(_employee)}`);

    return _employee.get({plain: true});
};

exports.findAll = async () => {
    const employees = await Employee.findAll({});

    if (!employees || employees.length === 0) {
        logger.error(`${moduleName} no employees present in db / db error`);
        throw new AppError('No employees present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all employees successfully`);

    return employees.map(employee => { employee.get({plain: true})});
};

exports.findAllEmployeesNamesAndIds = async () => {
    const employees = await Employee.findAll({ attributes: ['id', 'name']});

    if (!employees || employees.length === 0) {
        logger.error(`${moduleName} no employees present in db / db error`);
        throw new AppError('No employees present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all employees names successfully`);

    return employees.map(employee => employee.get({plain: true}));
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

    return employees.map(employee => employee.get({plain: true}));
};

exports.updateTitle = async (employeeToUpdate) => {
    const employee = await Employee.update({
        title: employeeToUpdate.title,
    }, {
        where: {
            id: employeeToUpdate.id
        }
    });

    if (!employee || employee[0] === 0) {
        logger.error(`${moduleName} employee to update title not found id: ${employeeToUpdate.id}`);
        throw new AppError(`Employee ${employeeToUpdate.id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated employee title with id ${employeeToUpdate.id}: ${JSON.stringify(employeeToUpdate.title)}`);
    return `Employee ${employeeToUpdate.id} title successfully updated! New title: ${employeeToUpdate.title}`;
};

exports.update = async (employee, transaction) => {
    const _employee = await Employee.update({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
        }, {
        where: {
                id: employee.id
            },
        },
        transaction
    );

    const address = await Address.update({
        street: employee.address.street,
        city: employee.address.city,
        zip: employee.address.zip,
        country: employee.address.country
    }, {
        where: {employee_id: employee.id},
        transaction
    });

    if ((!_employee || _employee[0] === 0) || (!address || address[0] === 0)) {
        logger.error(`${moduleName} employee and or address to update not found id: ${employee.id} / db error`);
        return false;
    }

    logger.debug(`${moduleName} updated employee, id ${employee.id}: ${JSON.stringify(_employee)}`);
    return {message: `Employee ${employee.id} successfully updated!`};
};

exports.findNameById = async (id) => {
    const employee = await Employee.findByPk(id, {
        attributes: ['name']
    });

    if (!employee) {
        logger.error(`${moduleName} employee ${id} not present in db / db error`);
        throw new AppError(`Employee name ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved employee name by id: ${id} | ${JSON.stringify(employee)}`);
    return employee.get({plain: true}).name;
};

exports.findById = async (id) => {
    const employee = await Employee.findByPk(id, {
        include: {
            association: 'address',
            attributes: ['street', 'city', 'zip', 'country']
        },
    });

    if (!employee) {
        logger.error(`${moduleName} employee ${id} not present in db / db error`);
        throw new AppError(`Employee ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved employee by id: ${id} | ${JSON.stringify(employee)}`);
    return employee.get({plain: true});
};

exports.findTitleById = async (id) => {
    const employee = await Employee.findByPk(id, {
        attributes: ['title']
    });

    if (!employee) {
        logger.error(`${moduleName} employee ${id} not present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} retrieved employee title by id: ${id} | ${JSON.stringify(employee)}`);
    return employee.get({plain: true}).title;
};

exports.findNameAndTitleById = async (id) => {
    const employee = await Employee.findByPk(id, {
        attributes: ['name', 'title'],
    });

    if (!employee) {
        logger.error(`${moduleName} employee ${id} not present in db / db error`);
        throw new AppError(`Employee ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved employee name by id: ${id} | ${JSON.stringify(employee)}`);
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

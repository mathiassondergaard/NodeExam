const employeeRepository = require('./employee-repository');
const {service: authService} = require('../auth');
const {AppError} = require('../../error');
const db = require('../../db');


exports.create = async (body) => {

    const transaction = await db.sequelize.transaction();

    const roles = body.roles;

    //if title is null, default will be used
    const employeeToCreate = {
        name: body.name,
        email: body.email,
        phone: body.phone,
        title: body.title,
        address: body.address,
    };

    const employee = await employeeRepository.create(employeeToCreate, transaction);
    const userIsCreated = await authService.createUserForEmployee(employee, roles, transaction);

    if (!employee || !userIsCreated) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return employee;
};

exports.delete = async (id) => {
    return await employeeRepository.delete(id);
};

exports.findAll = async () => {
    return await employeeRepository.findAll();
};

exports.findMultipleByIds = async (ids) => {
    return await employeeRepository.findMultipleByIds(ids);
};

exports.findAllEmployeesNames = async () => {
    return await employeeRepository.findAllEmployeesNames();
};

exports.findById = async (id) => {
    return await employeeRepository.findById(id);
};

exports.findNameById = async (id) => {
    return await employeeRepository.findNameById(id);
};

exports.findNameAndTitleById = async (id) => {
    return await employeeRepository.findNameAndTitleById(id);
};

exports.update = async (employee, currentEmployeeId) => {
    const transaction = await db.sequelize.transaction();

    if (currentEmployeeId !== parseInt(employee.id)) {
        const employeeTitle = await employeeRepository.findTitleById(employee.id);
        if (!employeeTitle) {
            return false;
        }
        if (employeeTitle !== 'Supervisor' || 'Manager') {
            throw new AppError(`Employee ${employee.id} could not be updated, invalid permission!`, 401, true);
        }
    }

    const employeeToUpdate = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        title: employee.title,
        address: employee.address,
    };

    const updated = await employeeRepository.update(employeeToUpdate, transaction);

    if (!updated) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return updated;
};


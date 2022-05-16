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

    return true;
}
;

exports.delete = async (id) => {
    return await employeeRepository.delete(id);
};

exports.findAll = async () => {
    return await employeeRepository.findAll();
};

exports.findMultipleByIds = async (ids) => {
    return await employeeRepository.findMultipleByIds(ids);
};

exports.findById = async (id) => {
    return await employeeRepository.findById(id);
};

exports.findNameAndTitleById = async (id) => {
    return await employeeRepository.findNameAndTitleById(id);
};

exports.update = async (id, currentEmployeeId, body) => {
    const transaction = await db.sequelize.transaction();

    if (currentEmployeeId !== parseInt(id)) {
        const employeeTitle = await employeeRepository.findTitleById(id);
        if (!employeeTitle) {
            return false;
        }
        if (employeeTitle !== 'Supervisor' || 'Manager') {
            throw new AppError(`Employee ${id} could not be updated, invalid permission!`, 401, true);
        }
    }

    const employeeToUpdate = {
        name: body.name,
        email: body.email,
        phone: body.phone,
        title: body.title,
        address: body.address,
    };

    const updated = await employeeRepository.update(id, employeeToUpdate, transaction);

    if (!updated) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return updated;
};


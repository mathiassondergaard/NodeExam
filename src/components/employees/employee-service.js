const employeeRepository = require('./employee-repository');
const authService = require('../auth/auth-service'); //TODO FIX THIS IMPORT
const {AppError} = require('../../error');
const db = require('../../db');


exports.create = async (body) => {
    const transaction = await db.sequelize.transaction();

    //if title is null, default will be used
    const employeeToCreate = {
        name: body.name,
        email: body.email,
        phone: body.phone,
        title: body.title,
        address: body.address,
    };

    const employee = await employeeRepository.create(employeeToCreate, transaction);
    //return true if user is created and send email, else return false
    //const userIsCreated = userService.generateUserForEmployee(transaction, name);

    if (!employee) {
        await transaction.rollback();
        throw new AppError('Failed to create employee!', 500, true);
    }

    const userIsCreated = await authService.createUserForEmployee(employee, transaction);

    if (!userIsCreated) {
        await transaction.rollback();
        throw new AppError('Failed to create employee!', 500, true);
    }

    await transaction.commit();

    return true;
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

exports.findById = async (id) => {
    return await employeeRepository.findById(id);
};

exports.update = async (id, body) => {

    const employeeToUpdate = {
        name: body.name,
        email: body.email,
        phone: body.phone,
        title: body.title,
        address: body.address,
    };

    return await employeeRepository.update(id, employeeToUpdate);
};


const employeeService = require('./employee-service');
const {logger} = require('../../common/log');
const {AppError} = require('../../error');

const moduleName = 'employee-controller.js -';

exports.create = async (req, res, next) => {

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const created = await employeeService.create(req.body);

    if (!created) {
        logger.error(`${moduleName} failed to create employee`);
        return next(new AppError('Failed to create employee!', 500, true));
    }

    logger.info(`${moduleName} successfully created employee ${JSON.stringify(created)}`);
    return res.status(201).send(created);

};

exports.delete = async (req, res, next) => {
    const deleted = await employeeService.delete(req.params.id, req.employeeId);

    if (!deleted) {
        logger.error(`${moduleName} failed to delete employee`);
        return next(new AppError('Failed to delete employee!', 500, true));
    }

    logger.info(`${moduleName} successfully deleted employee ${JSON.stringify(req.params.id)}`);
    return res.status(200).send(deleted);

};

exports.findAll = async (req, res, next) => {
    const employees = await employeeService.findAll();

    if (!employees) {
        logger.error(`${moduleName} failed to find all employees`);
        return next(new AppError('Failed to find employees!', 500, true));
    }

    logger.info(`${moduleName} successfully found all employees`);
    return res.status(200).send(employees);

};

exports.findEmployeesNamesAndIds = async (req, res, next) => {
    const employees = await employeeService.findAllEmployeesNamesAndIds();

    if (!employees) {
        logger.error(`${moduleName} failed to find all employees`);
        return next(new AppError('Failed to find employees!', 500, true));
    }

    logger.info(`${moduleName} successfully found all employees`);
    return res.status(200).send(employees);
};

exports.findById = async (req, res, next) => {

    const employee = await employeeService.findById((req.params.id));

    if (!employee) {
        logger.error(`${moduleName} failed to find employee`);
        return next(new AppError('Failed to find employee!', 500, true));
    }

    logger.info(`${moduleName} successfully found employee ${req.params.id}`);
    return res.status(200).send(employee);

};

exports.findNameByIdFromToken = async (req, res, next) => {

    const name = await employeeService.findNameById(req.employeeId);

    if (!name) {
        logger.error(`${moduleName} failed to find employee name ${req.employeeId}`);
        return next(new AppError('Failed to find employee name!', 500, true));
    }

    logger.info(`${moduleName} successfully found employee name ${req.employeeId}`);
    return res.status(200).send(name);

};

exports.update = async (req, res, next) => {

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    if (!req.roles.includes('ADMIN')) {
        if (req.employeeId !== req.params.id) {
            return next(new AppError('Failed to update employee, permission denied!'), 401, true);
        }
    }

    req.body.id = req.params.id;

    const updated = await employeeService.update(req.body, req.employeeId);

    if (!updated) {
        logger.error(`${moduleName} failed to update employee`);
        return next(new AppError('Failed to update employee!', 500, true));
    }

    logger.info(`${moduleName} successfully updated employee ${req.params.id}`);
    res.status(200).send(updated);
};



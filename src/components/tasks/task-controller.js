const taskService = require('./task-service');
const {logger} = require('../../common/log');
const {AppError} = require('../../error');

const moduleName = 'task-controller.js -';

exports.create = async (req, res, next) => {

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const created = await taskService.create(req.body, req.employeeId);

    if (!created) {
        logger.error(`${moduleName} failed to create task`);
        return next(new AppError('Failed to create task!', 500, true));
    }

    logger.info(`${moduleName} successfully created task ${JSON.stringify(created)}`);
    return res.status(201).send(created);

};

exports.delete = async (req, res, next) => {
    const deleted = await taskService.delete(req.params.id, req.employeeId);

    if (!deleted) {
        logger.error(`${moduleName} failed to delete task`);
        return next(new AppError('Failed to delete task!', 500, true));
    }

    logger.info(`${moduleName} successfully deleted task ${JSON.stringify(req.params.id)}`);
    return res.status(200).send(deleted);

};

exports.findAll = async (req, res, next) => {
    const tasks = await taskService.findAll();

    if (!tasks) {
        logger.error(`${moduleName} failed to find all tasks`);
        return next(new AppError('Failed to find tasks!', 500, true));
    }

    logger.info(`${moduleName} successfully found all tasks`);
    return res.status(200).send(tasks);

};

exports.findById = async (req, res, next) => {

    const task = await taskService.findById((req.params.id));

    if (!task) {
        logger.error(`${moduleName} failed to find task`);
        return next(new AppError('Failed to find task!', 500, true));
    }

    logger.info(`${moduleName} successfully found task ${req.params.id}`);
    return res.status(200).send(task);

};

exports.update = async (req, res, next) => {

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const updated = await taskService.update(req.params.id, req.body, req.employeeId);

    if (!updated) {
        logger.error(`${moduleName} failed to update task`);
        return next(new AppError('Failed to update task!', 500, true));
    }

    logger.info(`${moduleName} successfully updated task ${req.params.id}`);
    res.status(200).send(updated);
};

exports.updateAssignedEmployees = async (req, res, next) => {

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const updated = await taskService.updateAssignedEmployees(req.params.id, req.employeeId, req.body);

    if (!updated) {
        logger.error(`${moduleName} failed to update task assigned employees`);
        return next(new AppError('Failed to update task!', 500, true));
    }

    logger.info(`${moduleName} successfully updated task assigned employees ${req.params.id}`);
    res.status(200).send(updated);
};

exports.updateStatus = async (req, res, next) => {
    if (!req.params.status) {
        logger.error(`${moduleName} no status received`);
        return next(new AppError('Please provide a status!', 400, true));
    }

    const updated = await taskService.updateStatus(req.params.id, req.params.status, req.employeeId);

    if (!updated) {
        logger.error(`${moduleName} failed to update task status`);
        return next(new AppError('Failed to update task status!', 500, true));
    }

    logger.info(`${moduleName} successfully updated task status ${req.params.id}, ${req.params.status}`);
    res.status(200).send(updated);
};

exports.updateLevel = async (req, res, next) => {
    if (!req.params.level) {
        logger.error(`${moduleName} no level received`);
        return next(new AppError('Please provide a level!', 400, true));
    }

    const updated = await taskService.updateLevel(req.params.id, req.params.level, req.employeeId);

    if (!updated) {
        logger.error(`${moduleName} failed to update task level`);
        return next(new AppError('Failed to update task level!', 500, true));
    }

    logger.info(`${moduleName} successfully updated task level ${req.params.id}, ${req.params.level}`);
    res.status(200).send(updated);
};

exports.updateCompletedAt = async (req, res, next) => {
    const updated = await taskService.updateCompletedAt(req.params.id, req.body.date, req.employeeId);

    if (!updated) {
        logger.error(`${moduleName} failed to update task completed at`);
        return next(new AppError('Failed to update task completed at!', 500, true));
    }

    logger.info(`${moduleName} successfully updated task completed at ${req.params.id}, ${req.body.date}`);
    res.status(200).send(updated);
};

exports.updateStartedAt = async (req, res, next) => {
    const updated = await taskService.updateStartedAt(req.params.id, req.body.date, req.employeeId);

    if (!updated) {
        logger.error(`${moduleName} failed to update task started at`);
        return next(new AppError('Failed to update task started at!', 500, true));
    }

    logger.info(`${moduleName} successfully updated task started at ${req.params.id}, ${req.params.status}`);
    res.status(200).send(updated);
};

exports.findAllByEmployeeId = async (req, res, next) => {
    const tasks = await taskService.findAllByEmployeeId(req.params.employeeId);

    if (!tasks) {
        logger.error(`${moduleName} failed to find all tasks by employee`);
        return next(new AppError('Failed to find tasks by employee!', 500, true));
    }

    logger.info(`${moduleName} successfully found tasks for employee id ${req.params.employeeId}`);
    return res.status(200).send(tasks);
};

exports.findAllByAssignee = async (req, res, next) => {
    const tasks = await taskService.findAllByAssignee(req.params.assignee);

    if (!tasks) {
        logger.error(`${moduleName} failed to find all tasks by assignee`);
        return next(new AppError('Failed to find tasks by assignee!', 500, true));
    }

    logger.info(`${moduleName} successfully found tasks for assignee ${req.params.assignee}`);
    return res.status(200).send(tasks);
};
const taskRepository = require('./task-repository');
const {AppError} = require('../../error');
const {employeeService} = require('../employees')


exports.create = async (body) => {

    const employees = await employeeService.findMultipleByIds(body.employeeIds)

    // If level is null, default will be used
    const taskToCreate = {
        name: body.name,
        description: body.description,
        assignee: body.assignee,
        level: body.level,
        assignedEmployees: employees,
    };

    return await taskRepository.create(taskToCreate);
};

exports.delete = async (id, employeeId) => {

    const employee = employeeService.findById(employeeId)
    const assignee = await taskRepository.findAssigneeById(id);

    if (!assignee) {
        throw new AppError(`Task ${id} could not be deleted!`, 500, true);
    }
    // Only assignee / supervisor/manager can delete tasks
    if (!employee.name === assignee || (employee.title === 'Supervisor' || 'Manager')) {
        throw new AppError(`Task ${id} could not be deleted, invalid permission!`, 401, true);
    }


    return await taskRepository.delete(id);
};

exports.findAll = async () => {
    return await taskRepository.findAll();
};

exports.findById = async (id) => {
    return await taskRepository.findById(id);
};

exports.update = async (id, body) => {

    const employees = await employeeService.findMultipleByIds(body.employeeIds)

    const taskToUpdate = {
        name: body.name,
        description: body.description,
        assignee: body.assignee,
        level: body.level,
        status: body.status,
        startedAt: body.startedAt,
        completedAt: body.completedAt,
        assignedEmployees: employees,
    };

    return await taskRepository.update(id, taskToUpdate);
};

exports.updateStatus = async (id, status) => {
    const statusValidation = ['NOT-STARTED', 'ON-GOING', 'POSTPONED', 'COMPLETED'];

    if (!statusValidation.includes(status.toUpperCase())) {
        throw new AppError(`Failed to update status - invalid status! ${status}`, 500, true);
    }

    return await taskRepository.updateStatus(id, status.toUpperCase());
};

exports.updateStartedAt = async (id, date) => {
    if (!date) {
        date = new Date();
    }
    return await taskRepository.updateStartedAt(id, date);
};

exports.updateCompletedAt = async (id, date) => {
    if (!date) {
        date = new Date();
    }
    return await taskRepository.updateCompletedAt(id, date);
};

exports.findAllByEmployeeId = async (employeeId) => {
    return await taskRepository.findAllByEmployeeId(employeeId);
};

exports.findAllByAssignee = async (assignee) => {
    return await taskRepository.findAllByAssignee(assignee);
};
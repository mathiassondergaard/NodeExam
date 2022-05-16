const taskRepository = require('./task-repository');
const {AppError} = require('../../error');
const {service: employeeService} = require('../employees')

exports.create = async (body, employeeId) => {

    const assignee = await employeeService.findNameAndTitleById(employeeId);

    if (!assignee) {
        return false;
    }

    // If level is null, default will be used
    const taskToCreate = {
        name: body.name,
        description: body.description,
        assignee: assignee.name,
        level: body.level,
        assignedEmployees: body.assignedEmployees,
    };

    return await taskRepository.create(taskToCreate);
};

exports.updateAssignedEmployees = async (id, employeeId, body) => {
    await validatePermissionsBasedOnAssignee(id, employeeId, 'update');

    const updated = await taskRepository.updateAssignedEmployees(id, body.assignedEmployees);

    if (!updated) {
        return false;
    }

    return updated;
};

exports.delete = async (id, employeeId) => {
    await validatePermissionsBasedOnAssignee(id, employeeId, 'delete');

    return await taskRepository.delete(id);
};

exports.findAll = async () => {
    const tasks = await taskRepository.findAll();

    if (!tasks) {
        return false;
    }

    tasks.forEach(task => task.assignedEmployees = task.assignedEmployees.map(employee => {return {id: employee.id, name: employee.name}}));

    return tasks;
};

exports.findById = async (id) => {
    const task = await taskRepository.findById(id);

    if (!task) {
        return false;
    }

    task.assignedEmployees = task.assignedEmployees.map(employee => {return {id: employee.id, name: employee.name}});

    return task;
};

exports.update = async (id, body, employeeId) => {
    await validatePermissionsBasedOnAssignee(id, employeeId, 'update');

    const taskToUpdate = {
        name: body.name,
        description: body.description,
        level: body.level,
        status: body.status,
    };

    return await taskRepository.update(id, taskToUpdate);
};

exports.updateStatus = async (id, status, employeeId) => {
    await validatePermissionsBasedOnAssignedEmployee(id, employeeId, 'update');

    const statusValidation = ['NOT-STARTED', 'ON-GOING', 'POSTPONED', 'COMPLETED'];

    if (!statusValidation.includes(status.toUpperCase())) {
        throw new AppError(`Failed to update status - invalid status! ${status}`, 500, true);
    }

    return await taskRepository.updateStatus(id, status.toUpperCase());
};

exports.updateLevel = async (id, level, employeeId) => {
    await validatePermissionsBasedOnAssignedEmployee(id, employeeId, 'update');

    const statusValidation = ['LOW', 'MEDIUM', 'HIGH'];

    if (!statusValidation.includes(level.toUpperCase())) {
        throw new AppError(`Failed to update level - invalid level! ${level}`, 500, true);
    }

    return await taskRepository.updateLevel(id, level.toUpperCase());
};

exports.updateStartedAt = async (id, date, employeeId) => {
    await validatePermissionsBasedOnAssignedEmployee(id, employeeId, 'update');

    if (!date) {
        date = new Date();
    }
    return await taskRepository.updateStartedAt(id, date);
};

exports.updateCompletedAt = async (id, date, employeeId) => {
    await validatePermissionsBasedOnAssignedEmployee(id, employeeId, 'update');

    if (!date) {
        date = new Date();
    }
    return await taskRepository.updateCompletedAt(id, date);
};

exports.findAllByEmployeeId = async (employeeId) => {
    const tasks = await taskRepository.findAllByEmployeeId(employeeId);

    if (!tasks) {
        return false;
    }

    tasks.forEach(task => task.assignedEmployees = task.assignedEmployees.map(employee => {return {id: employee.id, name: employee.name}}));

    return tasks;
};

exports.findAllByAssignee = async (assignee) => {
    const tasks = await taskRepository.findAllByAssignee(assignee);

    if (!tasks) {
        return false;
    }

    tasks.forEach(task => task.assignedEmployees = task.assignedEmployees.map(employee => {return {id: employee.id, name: employee.name}}));

    return tasks;
};

// Used to avoid duplicate code, validates based on assignee
// is the same as the employee doing the action and
// the level of the employee
const validatePermissionsBasedOnAssignee = async (id, employeeId, method) => {
    const assignee = await taskRepository.findAssigneeById(id);
    const employee = await employeeService.findNameAndTitleById(employeeId)

    if (!assignee || !employee) {
        throw new AppError(`Task ${id} could not be ${method}d!`, 500, true);
    }

    if (employee.name.toLowerCase() !== assignee.toLowerCase()) {
        if ((employee.title.toLowerCase() !== 'supervisor' || 'manager')) {
            throw new AppError(`Task ${id} could not be ${method}d, invalid permission!`, 401, true);
        }
    }
};

const validatePermissionsBasedOnAssignedEmployee = async (id, employeeId, method) => {
    const employee = await employeeService.findNameAndTitleById(employeeId)

    if (!employee) {
        throw new AppError(`Task ${id} could not be ${method}d!`, 500, true);
    }

    if (!await taskRepository.checkIfEmployeeIsAssignedToTask(id, employeeId)) {
        if ((employee.title.toLowerCase() !== 'supervisor' || 'manager')) {
            throw new AppError(`Task ${id} could not be ${method}d, invalid permission!`, 401, true);
        }
    }
};
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

exports.update = async (body, employeeId) => {
    await validatePermissionsBasedOnAssignee(body.id, employeeId, 'update');

    const taskToUpdate = {
        id: body.id,
        name: body.name,
        description: body.description,
        level: body.level,
        status: body.status,
        startedAt: body.completedAt,
        completedAt: body.completedAt,
        assignedEmployees: body.assignedEmployees
    };

    if (taskToUpdate.startedAt && !taskToUpdate.completedAt) {
        taskToUpdate.status = 'ON-GOING';
    }
    else if (taskToUpdate.completedAt) {
        taskToUpdate.status = 'COMPLETED';
    }

    return await taskRepository.update(taskToUpdate);
};

exports.updateStatus = async (taskToUpdate, employeeId) => {
    await validatePermissionsBasedOnAssignedEmployee(taskToUpdate.id, employeeId, 'update');

    const statusValidation = ['NOT-STARTED', 'ON-GOING', 'POSTPONED', 'COMPLETED'];

    if (!statusValidation.includes(taskToUpdate.status.toUpperCase())) {
        throw new AppError(`Failed to update status - invalid status! ${taskToUpdate.status}`, 500, true);
    }

    return await taskRepository.updateStatus(taskToUpdate);
};

exports.updateLevel = async (taskToUpdate, employeeId) => {
    await validatePermissionsBasedOnAssignedEmployee(taskToUpdate.id, employeeId, 'update');

    const statusValidation = ['LOW', 'MEDIUM', 'HIGH'];

    if (!statusValidation.includes(taskToUpdate.level.toUpperCase())) {
        throw new AppError(`Failed to update level - invalid level! ${taskToUpdate.level}`, 500, true);
    }

    return await taskRepository.updateLevel(taskToUpdate);
};

exports.startTask = async (taskToUpdate, employeeId) => {
    await validatePermissionsBasedOnAssignedEmployee(taskToUpdate.id, employeeId, 'update');

    taskToUpdate.date = new Date();

    const message = await taskRepository.startTask(taskToUpdate);

    return {
        message: message,
        date: taskToUpdate.date,
        status: 'ON-GOING'
    }
};

exports.completeTask = async (taskToUpdate, employeeId) => {
    await validatePermissionsBasedOnAssignedEmployee(taskToUpdate.id, employeeId, 'update');

    taskToUpdate.date = new Date();

    const message = await taskRepository.completeTask(taskToUpdate);

    return {
        message: message,
        date: taskToUpdate.date,
        status: 'COMPLETED'
    }
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
        if (employee.title !== "Supervisor" && employee.title !== "Manager") {
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
        if (employee.title !== "Supervisor" && employee.title !== "Manager") {
            throw new AppError(`Task ${id} could not be ${method}d, invalid permission!`, 401, true);
        }
    }
};
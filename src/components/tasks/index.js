const controller = require('./task-controller');
const service = require('./task-service');
const Task = require('./task-model');
const router = require('./task-routes');
const repository = require('./task-repository');

module.exports = {
    controller,
    service,
    Task,
    router,
    repository
};
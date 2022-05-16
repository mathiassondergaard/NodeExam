const controller = require('./employee-controller');
const service = require('./employee-service');
const Employee = require('./employee-model');
const router = require('./employee-routes');
const repository = require('./employee-repository');

module.exports = {
    controller,
    service,
    Employee,
    router,
    repository
};

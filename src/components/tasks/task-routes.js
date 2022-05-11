const controller = require('./task-controller');
const router = require('express').Router();
const {apiLimiter} = require('../../common');
const { asyncHandler } = require('../../error');

module.exports = (app) => {
    app.use(apiLimiter);

    app.use((req, res, next) => {
        res.header(
            "Access-Control-Allow-Headers",
            "Bearer, Origin, Content-Type, Accept"
        );
        next();
    });

    // Everything under here just needs JWT

    router.post('/', asyncHandler(controller.create)); //maybe needs modguard/adminguard

    router.delete('/:id', asyncHandler(controller.delete));

    router.get('/:id', asyncHandler(controller.findById));

    router.patch('/:id/started-at', asyncHandler(controller.updateStartedAt));

    router.patch('/:id/completed-at', asyncHandler(controller.updateCompletedAt));

    router.get('/employee/:employeeId', asyncHandler(controller.findAllByEmployeeId));

    router.get('/assignee/:assignee', asyncHandler(controller.findAllByAssignee));

    // Everything under here needs modguard/adminguard as well

    router.put('/:id', asyncHandler(controller.update));

    router.get('/', asyncHandler(controller.findAll));

    router.patch('/:id/status/:status', asyncHandler(controller.updateStatus));

    app.use('/api/resources/tasks', router);

};

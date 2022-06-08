const controller = require('./task-controller');
const router = require('express').Router();
const {apiLimiter, verifyJwt} = require('../../common');
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

    // JWT

    router.post('/', asyncHandler(verifyJwt), asyncHandler(controller.create));

    router.delete('/:id', asyncHandler(verifyJwt), asyncHandler(controller.delete));

    router.get('/:id', asyncHandler(verifyJwt), asyncHandler(controller.findById));

    router.patch('/:id/start', asyncHandler(verifyJwt), asyncHandler(controller.startTask));

    router.patch('/:id/level/:level', asyncHandler(verifyJwt), asyncHandler(controller.updateLevel));

    router.patch('/:id/complete', asyncHandler(verifyJwt), asyncHandler(controller.completeTask));

    router.get('/employee/internal', asyncHandler(verifyJwt), asyncHandler(controller.findAllByTokenEmployeeId));

    router.get('/employee/:employeeId', asyncHandler(verifyJwt), asyncHandler(controller.findAllByEmployeeId));

    router.get('/assignee/:assignee', asyncHandler(verifyJwt), asyncHandler(controller.findAllByAssignee));

    router.patch('/:id/status/:status', asyncHandler(verifyJwt), asyncHandler(controller.updateStatus));

    router.put('/:id',asyncHandler(verifyJwt), asyncHandler(controller.update));

    router.get('/', asyncHandler(verifyJwt), asyncHandler(controller.findAll));

    app.use('/api/resources/tasks', router);

};

const controller = require('./employee-controller');
const router = require('express').Router();
const {apiLimiter, adminGuard, verifyJwt} = require('../../common');
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

    router.get('/:id', asyncHandler(verifyJwt), asyncHandler(controller.findById));

    router.get('/name', asyncHandler(verifyJwt), asyncHandler(controller.findNameByIdFromToken));

    router.put('/:id', asyncHandler(verifyJwt), asyncHandler(controller.update));

    // Admin

    router.post('/', [
        asyncHandler(verifyJwt),
        adminGuard
    ], asyncHandler(controller.create)); //maybe needs modguard/adminguard

    router.delete('/:id', [
        asyncHandler(verifyJwt),
        adminGuard
    ], asyncHandler(controller.delete)); //maybe needs modguard/adminguard

    router.get('/', [
        asyncHandler(verifyJwt),
        adminGuard
    ], asyncHandler(controller.findAll));

    app.use('/api/resources/employees', router);

};

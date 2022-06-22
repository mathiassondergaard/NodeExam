const controller = require('./logging-controller');
const router = require('express').Router();
const {apiLimiter, verifyJwt} = require('../../common');
const { asyncHandler } = require('../../error');

module.exports = (app) => {
    app.use(apiLimiter);

    app.use((req, res, next) => {
        next();
    });

    app.use((req, res, next) => {
        res.header(
            "Access-Control-Allow-Headers",
            "Bearer, Origin, Content-Type, Accept"
        );
        next();
    });

    // Items

    router.get('/collect', asyncHandler(verifyJwt), asyncHandler(controller.collectLogs));

    app.use('/api/utility/logs', router);
};

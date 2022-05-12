const controller = require('./employee-controller');
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

    router.get('/:id', asyncHandler(controller.findById));

    router.put('/:id', asyncHandler(controller.update));

    // Everything under here needs adminguard as well

    router.post('/', asyncHandler(controller.create)); //maybe needs modguard/adminguard

    router.get('/', asyncHandler(controller.findAll));

    app.use('/api/resources/tasks', router);

};

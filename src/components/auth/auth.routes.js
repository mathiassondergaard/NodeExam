const {signupVerification, signInValidator} = require('../../middlewares');
const {verifyToken} = require('../../middlewares');
const controller = require('./auth.controller');
const router = require('express').Router();

const apiLimiter = require('../../middlewares/rateLimiter');
const { errorHandler, asyncErrHandler } = require('../../error');

module.exports = (app) => {
    app.use(apiLimiter);

    app.use((req, res, next) => {
        res.header(
            "Access-Control-Allow-Headers",
            "Bearer, Origin, Content-Type, Accept"
        );
        next();
    });

    router.post('/sign-up',
        [
        asyncErrHandler(signupVerification.signupValidator),
        signupVerification.checkIfRolesExist
            ],
        asyncErrHandler(controller.signUp)
    );

    router.post('/sign-in', asyncErrHandler(signInValidator), asyncErrHandler(controller.signIn));

    router.get('/users/', asyncErrHandler(verifyToken), asyncErrHandler(controller.userInfo));

    router.post('/refresh-token', asyncErrHandler(controller.refreshToken));

    app.use('/api/auth', router);

    app.use(errorHandler);
};

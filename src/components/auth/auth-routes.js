/*
const {signupVerification, signInValidator} = require('../middlewares');
const {verifyToken} = require('../middlewares');
const controller = require('../controllers/auth.controller');
const router = require('express').Router();

const apiLimiter = require('../middlewares/rateLimiter');
const { asyncHandler } = require('../error');


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
            asyncHandler(signupVerification.signupValidator),
        signupVerification.checkIfRolesExist
            ],
        asyncHandler(controller.signUp)
    );

    router.post('/sign-in', asyncHandler(signInValidator), asyncHandler(controller.signIn));

    router.get('/users/', asyncHandler(verifyToken), asyncHandler(controller.userInfo));

    router.post('/refresh-token', asyncHandler(controller.refreshToken));

    app.use('/api/auth', router);

};
 */
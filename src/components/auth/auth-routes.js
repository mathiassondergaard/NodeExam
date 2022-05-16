const controller = require('./auth-controller');
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

    // no auth

    router.post('/sign-in', asyncHandler(controller.signIn));

    router.patch('/users/first-login', asyncHandler(controller.changePasswordForNewUser));

    // JWT

    router.get('/users/:id', asyncHandler(verifyJwt), asyncHandler(controller.userInfo));

    router.put('/users/:id', asyncHandler(verifyJwt), asyncHandler(controller.updateUser));

    router.patch('/users/:id/password', asyncHandler(verifyJwt), asyncHandler(controller.changePassword));

    router.post('/users/token/refresh', asyncHandler(verifyJwt), asyncHandler(controller.refreshAccessToken));

    // JWT & Admin

    router.get('/users',
        [
            asyncHandler(verifyJwt),
            adminGuard,
        ],
        asyncHandler(controller.findUsers));

    router.delete('/users',
        [
            asyncHandler(verifyJwt),
            adminGuard,
        ],
        asyncHandler(controller.deleteUser));

    router.get('/roles',
        [
            asyncHandler(verifyJwt),
            adminGuard,
        ],
        asyncHandler(controller.findAllRoles));

    router.get('/roles/:role',
        [
            asyncHandler(verifyJwt),
            adminGuard,
        ],
        asyncHandler(controller.findRoleByRole));

    router.patch('/pw-token/expiry/user/:user',
        [
            asyncHandler(verifyJwt),
            adminGuard,
        ],
        asyncHandler(controller.updatePwTokenExpiry));

    router.patch('/users/:id/roles',
        [
            asyncHandler(verifyJwt),
            adminGuard,
        ],
        asyncHandler(controller.updateUserRoles));

    app.use('/api/auth', router);

};

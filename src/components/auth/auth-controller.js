const authService = require('./auth-service');
const {logger} = require('../../common/log');
const {AppError} = require("../../error");

const moduleName = 'auth-controller.js';

exports.signIn = async (req, res, next) => {
    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const signedIn = await authService.signIn(req.body);

    switch(signedIn) {
        case 'USERNAME_INVALID':
            logger.error(`${moduleName} invalid username ${req.body.username}`);
            return next(new AppError('Username is invalid!', 401, true));
        case 'PASSWORD_INVALID':
            logger.error(`${moduleName} invalid username ${req.body.username}`);
            return next(new AppError('Password is invalid!', 401, true));
        case false:
            logger.error(`${moduleName} refresh token or jwt error during sign-in ${req.body.username}`);
            return next(new AppError('Unexpected error occurred!', 500, true));
    }

    logger.info(`${moduleName} user successfully authenticated ${JSON.stringify(signedIn.user.username)}`);

    res.status(200).send({
        id: signedIn.user.id,
        username: signedIn.user.username,
        email: signedIn.user.email,
        roles: signedIn.user.roles,
        accessToken: signedIn.accessToken,
        refreshToken: signedIn.refreshToken,
    });
};

exports.userInfo = async (req, res, next) => {

    const user = await authService.findUserById(req.params.id);

    if (!user) {
        logger.error(`${moduleName} User by id ${req.params.id} details not found`);
        return next(AppError('User details could not found!', 404, true));
    }

    logger.info(`${moduleName} Retrieved user details for user: ${req.params.id}`);
    res.status(200).send(user);
};

exports.findUsers = async (req, res, next) => {

    const users = await authService.findAllUsers();

    if (!users) {
        logger.error(`${moduleName} no users found`);
        return next(AppError('No users could be found!', 404, true));
    }

    logger.info(`${moduleName} Retrieved all users`);
    res.status(200).send(users);
};

exports.updateUser = async (req, res, next) => {

    if (!req.roles.includes('ADMIN')) {
        if (req.userId !== req.params.id) {
            logger.error(`${moduleName} user could not be updated due to permissions`);
            return next(AppError('Failed to update user - permission denied!', 401, true));
        }
    }

    req.body.id = req.params.id;

    const updated = await authService.updateUser(req.body);

    if (!updated) {
        logger.error(`${moduleName} user could not be updated`);
        return next(AppError('Failed to update user!', 500, true));
    }

    logger.info(`${moduleName} updated user id ${req.params.id}`);
    res.status(200).send(updated);
};

exports.changePasswordForNewUser = async (req, res, next) => {

    const updated = await authService.changePasswordOnNewUser(req.body);

    switch (updated) {
        case 'INVALID':
            logger.error(`${moduleName} invalid token ${req.body.token}`);
            return next(new AppError('Token is invalid!', 401, true));
        case 'EXPIRED':
            logger.error(`${moduleName} token is expired ${req.body.token}`);
            return next(new AppError('Token is expired!', 401, true));
        case false:
            logger.error(`${moduleName} unexpected error on change pw for new user username ${req.body.username}`);
            return next(new AppError('Unexpected error occurred', 500, true));
    }

    res.status(200).send(updated);
};

exports.changePassword = async (req, res, next) => {
    req.body.id = req.params.id;
    const updated = await authService.changePassword(req.body, req.userId);

    if (!updated) {
        logger.error(`${moduleName} update pw failed ${req.params.id}`);
        return next(new AppError('Failed to update password!', 500, true));
    }

    res.status(200).send(updated);
};

exports.updateUserRoles = async (req, res, next) => {

    const updated = await authService.updateUserRoles(req.params.id, req.body.roles);

    if (!updated) {
        logger.error(`${moduleName} failed to update user roles`);
        return next(new AppError('Failed to update user roles!', 500, true));
    }

    res.status(200).send(updated);
};

exports.deleteUser = async (req, res, next) => {

    const deleted = await authService.deleteUser(req.params.id);

    if (!deleted) {
        logger.error(`${moduleName} failed to delete user`);
        return next(new AppError('Failed to delete user!', 500, true));
    }

    logger.info(`${moduleName} successfully deleted user ${JSON.stringify(req.params.id)}`);
    return res.status(200).send(deleted);
};

exports.findAllRoles = async (req, res, next) => {

    const roles = await authService.findAllRoles();

    if (!roles) {
        logger.error(`${moduleName} no roles found`);
        return next(AppError('No roles could be found!', 404, true));
    }

    logger.info(`${moduleName} Retrieved all roles`);
    res.status(200).send(roles);
};

exports.findRoleByRole = async (req, res, next) => {
    const role = await authService.findRoleByRole(req.params.role);

    if (!role) {
        logger.error(`${moduleName} Role by role name ${req.params.role} not found`);
        return next(AppError('Role could not found!', 404, true));
    }

    logger.info(`${moduleName} Retrieved role by role: ${req.params.role}`);
    res.status(200).send(role);
};


exports.updatePwTokenExpiry = async (req, res, next) => {

    const updated = await authService.updatePwTokenExpiryByUserId(req.params.user);

    if (!updated) {
        logger.error(`${moduleName} failed to update pw token expiry date`);
        return next(new AppError('Failed to update expiry date!', 500, true));
    }

    res.status(200).send(updated);
};


exports.refreshAccessToken = async (req, res, next) => {

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const jwtInfo = {
        userId: req.userId,
        roles: req.roles,
        employee: req.employeeId
    };

    const refreshed = await authService.refreshAccessToken(req.body.token, jwtInfo);

    switch (refreshed) {
        case 'INVALID':
            logger.error(`${moduleName} invalid token ${req.body.token}`);
            return next(new AppError('Token is invalid!', 401, true));
        case 'EXPIRED':
            logger.error(`${moduleName} token is expired ${req.body.token}`);
            return next(new AppError('Token is expired!', 401, true));
    }

    return res.status(200).send({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
    });
};


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const User = require('./user.model');
const Role = require('./role.model');
const RefreshToken = require('./refreshToken.model');
const {logger} = require('../../helpers/log');
const {AppError} = require("../../error");
const key = fs.readFileSync('private-key.pem');

const moduleName = 'auth.controller.js';

exports.signUp = async (req, res, next) => {
    logger.info(`${moduleName} request to signup user ${JSON.stringify(req.body)}`);

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password)
    });

    // defaulting to user role if no roles are present in body
    if (!req.body.roles) {
        logger.info(`${moduleName} using default user role for signup`);
        const role = await Role.findOne({name: "user"}).exec();
        user.roles = [role._id];

        await user.save();

        logger.info(`${moduleName} user successfully saved using default role (user)`);
        res.status(200).send({message: "User successfully signed up!"});
        return;
    }

    logger.info(`${moduleName} using roles from req.body for signup ${JSON.stringify(req.body.roles)}`);

    const roles = await Role.find({name: {$in: req.body.roles}}).exec();

    if (!roles) {
        logger.error(`${moduleName} roles could not be found ${JSON.stringify(req.body.roles)}`);
        return next(new AppError('Roles could not be found!', 404, true));
    }

    user.roles = roles.map(role => role._id);

    await user.save();

    logger.info(`${moduleName} user successfully signed up ${JSON.stringify(user)}`);
    res.status(200).send({message: 'User successfully signed up!'});
};

exports.signIn = async (req, res, next) => {
    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const user = await User.findOne({username: req.body.username}).populate('roles', '-__v').exec();
    if (!user) {
        logger.error(`${moduleName} user not present in database`);
        return next(new AppError('User could not be found!', 404, true));
    }

    // Create access token upon login
    let token = await generateJWT(user, next);

    // Find refresh token if it exists, otherwise create a new one.
    let refreshToken = await RefreshToken.findOne({user: user._id}).exec();
    if (!refreshToken) {
        logger.info(`${moduleName} created new refresh token for user ${JSON.stringify(user._id)}`);
        refreshToken = await RefreshToken.createRefreshToken(user);
    }

    const _roles = [];
    user.roles.forEach(role => {
        _roles.push(`ROLE_${role.name.toString().toUpperCase()}`);
    });

    logger.info(`${moduleName} user successfully authenticated ${JSON.stringify(user)}`);

    res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: _roles,
        accessToken: token,
        refreshToken: refreshToken.token,
    });
};

exports.userInfo = async (req, res, next) => {

    const user = await User.findById(req.params.id).select('_id, username, email, roles').exec();

    if (!user) {
        logger.error(`${moduleName} User by id details not found`);
        return next(AppError('User details could not found!', 404, true));
    }

    logger.info(`${moduleName} Retrieved user details for user: ${req.params.id}`);
    res.status(200).send(user);
};

exports.refreshToken = async (req, res, next) => {

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a token!', 403, true));
    }

    const {refreshToken: requestToken} = req.body;

    const refreshToken = await RefreshToken.findOne({token: requestToken}).exec();
    if (!refreshToken) {
        logger.error(`${moduleName} Refresh Token not present in database`);
        return next(new AppError('Refresh token could not be found!', 403, true));
    }

    // Verify expiry, if expired, remove it and prompt for new sign-in
    if (RefreshToken.verifyRtExpiration(refreshToken)) {
        logger.info(`${moduleName} Refresh Token is expired, requested for new login`);

        await RefreshToken.findByIdAndRemove(refreshToken._id, {useFindAndModify: false});
        return next(AppError('Refresh token is expired, please sign in again!', 403, true));
    }

    const user = await User.findById(refreshToken.user._id).exec();
    if (!user) {
        logger.error(`${moduleName} User representing refresh token not found`);
        return next(AppError('User representing refresh token not found!', 403, true));
    }

    // Generate new access token
    let _accessToken = await generateJWT(user, next);

    return res.status(200).send({
        accessToken: _accessToken,
        refreshToken: refreshToken.token,
    });
};

// Utilized instead of duplicate code
const generateJWT = (user, next) => {
    return new Promise((resolve) => {
        jwt.sign({id: user._id, employeeId: user.employeeId, roles: user.roles}, {
            key: key,
            passphrase: process.env.PRIVATE_KEY_PW
        }, {algorithm: process.env.KEY_ALGORITHM}, function (err, token) {
            if (err) {
                next(new AppError(err.message, 500, true));
            }
            resolve(token);
        });
    });
};

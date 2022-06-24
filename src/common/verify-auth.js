const jwt = require('jsonwebtoken');
const fs = require('fs');

const {logger} = require('./log');
const {AppError} = require("../error");
const publicKey = fs.readFileSync('public-key.pem');

const moduleName = 'verify-auth.js -';

// JWT Verification
module.exports.verifyToken = async (req, res, next) => {
        const token = getJwt(req);

        // Return 403 if token is not provided
        if (!token) {
            throw new AppError('No token was provided', 403, true);
        }

        // Verify token
        const decoded = await jwt.verify(token, publicKey, {algorithms: [process.env.KEY_ALGORITHM]});
        if (!decoded) {
            logger.error(`${moduleName} token is invalid`);
            throw new AppError('Token not valid - Unauthorized!', 401, true);
        }

        req.roles = decoded.roles;
        req.userId = decoded.id;
        req.employeeId = decoded.employeeId;

        return next();
};


// Admin guard
module.exports.adminGuard = (req, res, next) => {
    for (let i = 0; i < req.roles.length; i++) {
        if (req.roles[i].toLowerCase() === 'admin') {
            logger.debug(`${moduleName} adminGuard / user authorized to access this resource`);
            next();
            return;
        }
    }
    logger.debug(`${moduleName} adminGuard / user not authorized to access this resource`);
    throw new AppError('Admin role required - Unauthorized!', 401, true);
};

// Mod guard
module.exports.modGuard = (req, res, next) => {
    for (let i = 0; i < req.roles.length; i++) {
        if (req.roles[i].toLowerCase() === 'moderator') {
            logger.debug(`${moduleName} modGuard / user authorized to access this resource`);
            next();
            return;
        }
    }
    logger.debug(`${moduleName} modGuard / user not authorized to access this resource`);
    throw new AppError('Mod role required - Unauthorized!', 403, true);
};

module.exports.verifySocketToken = async (token) => {
    try {
        const decoded = await jwt.verify(token, publicKey, {algorithms: [process.env.KEY_ALGORITHM]});
        if (!decoded) {
            logger.error(`${moduleName} socket token is invalid`);
            return false;
        }
        return decoded;
    } catch (e) {
        logger.error(e.message);
        return false;
    }
};

const getJwt = (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }
    else if (req.query && req.query.token) {
        return req.query.token;
    }
    else if (req.cookies.jwt) {
        return req.cookies.jwt;
    }
    return null;
};


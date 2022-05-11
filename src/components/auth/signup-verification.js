const db = require('../db/auth.db.config');
const {User} = require('./');
const {logger} = require('../../common/log');
const {AppError} = require("../../error");

const moduleName = 'signup-verification.js -';

signupValidator = async (req, res, next) => {
    logger.info(`${moduleName} validate signup-request/uname & email ${JSON.stringify(req.body)}`);

    //Check if username is duplicated
    const userByUsername = await User.findOne({username: req.body.username}).exec();
    if (userByUsername) {
        logger.error(`${moduleName} verify username - username already in use ${JSON.stringify(req.body.username)}`);
        throw new AppError(`Username already in use!`, 400, true);
    }

    const userByEmail = await User.findOne({email: req.body.email}).exec();
    if (userByEmail) {
        logger.error(`${moduleName} verify email - email already in use ${JSON.stringify(req.body.email)}`);
        throw new AppError(`Email already in use!`, 400, true);
    }

    next();
};


checkIfRolesExist = (req, res, next) => {
    logger.info(`${moduleName} validate signup-request/roles ${JSON.stringify(req.body)}`);

    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!db.ROLES.includes(req.body.roles[i])) {
                logger.error(`${moduleName} verify roles - role does not exist: ${JSON.stringify(req.body.roles[i])}`);
                throw new AppError(`Role ${req.body.roles[i]} does not exist!`, 404, true);
            }
        }
    }
    next();
};


const signupVerification = {
    signupValidator,
    checkIfRolesExist
};

module.exports = signupVerification;

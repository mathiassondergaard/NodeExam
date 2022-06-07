const {logger} = require('../common/log');
const {TokenExpiredError, JsonWebTokenError} = require("jsonwebtoken");
const {ValidationError} = require('sequelize');

const moduleName = 'error-handler.js -';

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || err;

    if (process.env.NODE_ENV === 'production') {
        return handleErr(err, res, true);
    }
    return handleErr(err, res, false);
};

const handleErr = (err, res, production) => {
    if (err instanceof ValidationError) {
        const errors = err.errors.map(error => {
            return {
                message: error.message,
                model: error.path,
                givenValue: error.value,
            };
        });
        logger.error(`${moduleName} validation error ${JSON.stringify(errors)}`);
        return res.status(400).json(errors);
    }
    else if (err instanceof TokenExpiredError) {
        logger.error(`${moduleName} access token is expired`);
        return res.status(401).json({message: 'Access token was expired - Unauthorized!'});
    }
    else if (err instanceof JsonWebTokenError) {
        logger.error(`${moduleName} access token not valid`);
        return res.status(401).json({message: 'Access token not valid - Unauthorized!'});
    }
    else if (err.message === 'No token was provided') {
        return res.status(403).json({message: err.message});
    }

    if (!production) {
        logger.error(`${moduleName} ${JSON.stringify({status: err.status, message: err.message})}`);
        handleNotOperationalErr(err);
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
        });
    }
    handleNotOperationalErr(err);
    return res.status(err.statusCode).send({
        status: err.status,
        message: err.message,
    });
};

const handleNotOperationalErr = (err) => {
    if (!err.isOperational) {
        logger.error(`${moduleName} Fatal error occurred, restarting server... ${JSON.stringify(err)}`);
        return process.exit(1);
    }
};

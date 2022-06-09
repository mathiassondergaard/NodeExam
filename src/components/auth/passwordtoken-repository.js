const {logger} = require('../../common/log');
const PasswordToken = require('./passwordtoken-model');
const {AppError} = require('../../error');

const moduleName = 'passwordToken-repository.js -';

exports.create = async (passwordToken, transaction) => {
    const _passwordToken = await PasswordToken.create({
        token: passwordToken.token,
        expiryDate: passwordToken.expiryDate,
    }, {
        transaction
    });

    if (_passwordToken[0] === 0) {
        logger.error(`${moduleName} could not create passwordToken`);
        return false;
    }

    await _passwordToken.setUser(passwordToken.userId, {transaction});

    logger.debug(`${moduleName} created passwordToken ${JSON.stringify(_passwordToken)}`);

    return _passwordToken.get({plain: true}).token;
};

exports.findByToken = async (token) => {
    const passwordToken = await PasswordToken.findOne({ where: {token: token}, include: {
            association: 'user',
            attributes: ['id']
        }});

    if (!passwordToken) {
        logger.error(`${moduleName} passwordToken ${token} not present in db / db error`);
        throw new AppError(`PasswordToken ${token} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved passwordToken by token: ${token} | ${JSON.stringify(passwordToken)}`);
    return passwordToken.get({plain: true});
};

exports.updateExpiryByUserId = async (userId, newDate) => {

    const passwordToken = await PasswordToken.update({
        expiryDate: newDate
    }, {
        where: {
            user_id: userId
        },
    });

    if (!passwordToken || passwordToken[0] === 0) {
        logger.error(`${moduleName} password token to update date not found userid: ${userId}`);
        throw new AppError(`PasswordToken ${userId} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated passwordToken status with date ${userId}: ${JSON.stringify(newDate)}`);
    return {message: `PW token userid ${userId} expiry date successfully updated! New date: ${newDate}`};
};

exports.deleteByToken = async (token, transaction) => {
    const deleted = await PasswordToken.destroy({
        where: {
            token: token
        },
        transaction
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} passwordToken to delete not found ${token}`);
        return false;
    }

    logger.info(`${moduleName} delete passwordToken success, ${token}`);
    return true;
};

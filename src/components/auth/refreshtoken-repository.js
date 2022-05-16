const {logger} = require('../../common/log');
const RefreshToken = require('./refreshtoken-model');
const {AppError} = require('../../error');

const moduleName = 'refreshtoken-repository.js -';

exports.create = async (refreshToken) => {
    const _refreshToken = await RefreshToken.create({
        token: refreshToken.token,
        expiryDate: refreshToken.expiryDate,
        user_id: refreshToken.user.id,
    });

    if (_refreshToken[0] === 0) {
        logger.error(`${moduleName} could not create refreshToken`);
        throw new AppError(`Create refreshToken failed`, 500, true);
    }

    logger.debug(`${moduleName} created refreshToken ${JSON.stringify(_refreshToken)}`);

    return _refreshToken.get({plain: true}).token;
};

exports.findByToken = async (token) => {
    const refreshToken = await RefreshToken.findOne(
        {
            where: {token: token},
        });

    if (!refreshToken) {
        logger.error(`${moduleName} refreshToken ${token} not present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} retrieved refreshToken by token: ${token} | ${JSON.stringify(refreshToken)}`);
    return refreshToken;
};

exports.findByUserId = async (userId) => {
    const refreshToken = await RefreshToken.findOne({where: { user_id: userId}});

    if (!refreshToken) {
        logger.error(`${moduleName} refreshToken userid ${userId} not present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} retrieved refreshToken by: userid ${userId} | ${JSON.stringify(refreshToken)}`);
    return refreshToken.get({plain: true}).token;
};

exports.deleteByToken = async (token) => {
    const deleted = await RefreshToken.destroy({
        where: {
            token: token
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} refreshToken to delete not found id: ${token}`);
        throw new AppError(`RefreshToken ${token} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete refreshToken success, id: ${token}`);
    return true;
};

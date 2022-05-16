const {logger} = require('../../common/log');
const Role = require('./role-model');
const {AppError} = require('../../error');

const moduleName = 'role-repository.js -';

exports.findAll = async () => {
    const roles = await Role.findAll({});

    if (!roles || roles.length === 0) {
        logger.error(`${moduleName} no roles present in db / db error`);
        throw new AppError('No roles present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all roles successfully`);

    return roles.map(role => role.get({plain: true}));
};

exports.findByRole = async (role) => {
    const result = await Role.findOne({where: {role: role}});

    if (!result) {
        logger.error(`${moduleName} role ${role} not present in db / db error`);
        throw new AppError(`Role ${role} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved role by role: ${role} | ${JSON.stringify(role)}`);
    return result.get({plain: true});
};

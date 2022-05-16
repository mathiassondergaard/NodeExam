const {logger} = require('../../common/log');
const Role = require('./role-model');
const {AppError} = require('../../error');

const moduleName = 'role-repository.js -';

exports.create = async (role) => {
    const _role = await Role.create({
        role: role.name,
    });

    if (_role[0] === 0) {
        logger.error(`${moduleName} could not create role`);
        throw new AppError(`Create role failed`, 500, true);
    }

    logger.debug(`${moduleName} created role ${JSON.stringify(_role)}`);

    return true;
};

exports.findAll = async () => {
    const roles = await Role.findAll({});

    if (!roles || roles.length === 0) {
        logger.error(`${moduleName} no roles present in db / db error`);
        throw new AppError('No roles present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all roles successfully`);

    return roles;
};

exports.findByRole = async (role) => {
    const result = await Role.findOne({where: {role: role}});

    if (!result) {
        logger.error(`${moduleName} role ${role} not present in db / db error`);
        throw new AppError(`Role ${role} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved role by role: ${role} | ${JSON.stringify(role)}`);
    return role.get({plain: true});
};

exports.delete = async (id) => {
    const deleted = await Role.destroy({
        where: {
            id: id
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} role to delete not found id: ${id}`);
        throw new AppError(`Role ${id} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete role success, id: ${id}`);
    return {message: `Role ${id} successfully deleted!`};
};

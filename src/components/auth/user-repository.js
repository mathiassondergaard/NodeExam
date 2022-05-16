const {logger} = require('../../common/log');
const User = require('./user-model');
const {AppError} = require('../../error');

const moduleName = 'user-repository.js -';

exports.create = async (user, transaction) => {
    const _user = await User.create({
        username: user.username,
        email: user.email,
        password: user.password,
        employee: user.employee,
        roles: user.roles
    }, {
        include: ['employee', 'roles'],
        transaction
    });

    if (_user[0] === 0) {
        logger.error(`${moduleName} could not create user`);
        return false;
    }

    logger.debug(`${moduleName} created user ${JSON.stringify(_user)}`);

    return true;
};

exports.findAll = async () => {
    const users = await User.findAll({
        include: [{
            association: 'roles',
            attributes: ['id', 'role']
        },
        ],
        nested: true,
    });

    if (!users || users.length === 0) {
        logger.error(`${moduleName} no users present in db / db error`);
        throw new AppError('No users present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all users successfully`);

    return users;
};

exports.update = async (id, user) => {
    const _user = await User.update({
        username: user.username,
        email: user.email,
        roles: user.roles
    }, {
        include: 'role'
    }, {
        where: {
            id: id
        }
    });

    if (!_user || _user[0] === 0) {
        logger.error(`${moduleName} user to update not found id: ${id} / db error`);
        throw new AppError(`User ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated user, id ${id}: ${JSON.stringify(_user)}`);
    return {message: `User ${id} successfully updated!`};
};

exports.findById = async (id) => {
    const user = await User.findByPk(id, {
        include: [{
            association: 'roles',
            attributes: ['id', 'role']
        },
        ],
        nested: true,
    });

    if (!user) {
        logger.error(`${moduleName} user ${id} not present in db / db error`);
        throw new AppError(`User ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved user by id: ${id} | ${JSON.stringify(user)}`);
    return user.get({plain: true});
};

exports.findByUsername = async (username) => {
    const user = await User.findOne({
        where: {username: username},
        include: [{
            association: 'roles',
            attributes: ['id', 'role']
        }, {
            association: 'employee',
            attributes: ['id']
        }
        ],
    });

    if (!user) {
        logger.error(`${moduleName} user ${username} not present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} retrieved user by username: ${username} | ${JSON.stringify(user)}`);
    return user.get({plain: true});
};

exports.findPasswordById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: ['password']
    });

    if (!user) {
        logger.error(`${moduleName} user ${id} not present in db / db error`);
        throw new AppError(`User ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved user password by id: ${id}`);
    return user.get({plain: true});
};

exports.updatePassword = async (id, password) => {
    const user = await User.update({
        password: password,
    }, {
        where: {
            id: id
        }
    });

    if (!user || user[0] === 0) {
        logger.error(`${moduleName} user to update password not found id: ${id}`);
        throw new AppError(`User ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated user password with id ${id}`);
    return {message: `User ${id} password successfully updated!`};
};

exports.updatePasswordByUsername = async (username, password, transaction) => {
    const user = await User.update({
        password: password,
    }, {
        where: {
            username: username
        },
        transaction
    });

    if (!user || user[0] === 0) {
        logger.error(`${moduleName} user to update password not found username: ${username}`);
        return false;
    }

    logger.debug(`${moduleName} updated user password with username ${username}`);
    return true;
};

exports.delete = async (id) => {
    const deleted = await User.destroy({
        where: {
            id: id
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} user to delete not found id: ${id}`);
        throw new AppError(`User ${id} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete user success, id: ${id}`);
    return {message: `User ${id} successfully deleted!`};
};

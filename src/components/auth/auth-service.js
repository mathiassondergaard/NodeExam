const {v4: uuid} = require('uuid');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const fs = require("fs");

const db = require("../../db");
const userRepository = require('./user-repository');
const passwordTokenRepository = require('./passwordtoken-repository');
const refreshTokenRepository = require('./refreshtoken-repository');
const roleRepository = require('./role-repository');
const {AppError} = require('../../error');
const {mailer} = require('../../common/mailer');
const key = fs.readFileSync('private-key.pem');


// USERS

exports.createUserForEmployee = async (employee, transaction) => {

    const rolesToFind = ['USER'];
    const rolesToAdd = [];
    if (['Supervisor', 'Manager'].includes(employee.title)) {
        rolesToFind.push('MODERATOR');
        if (employee.title === 'Manager') {
            rolesToFind.push('ADMIN')
        }
    }

    for (const role of rolesToFind) {
        const result = await roleRepository.findByRole(role);
        rolesToAdd.push(result);
    }

    if (!rolesToAdd) {
        return false;
    }

    // Generate random password
    const password = crypto.randomBytes(6).toString('hex')
    const userToCreate = {
        username: generateUsername(employee.name),
        email: employee.email,
        password: bcrypt.hashSync(password),
        employee: employee,
        roles: rolesToAdd
    }

    const user = await userRepository.create(userToCreate, transaction);
    const passwordToken = await createPasswordToken(user, transaction);

    if (user && passwordToken) {
        const link = `${process.env.WMS_FRONTEND_BASE}/login/first/${passwordToken}`
        const mail = await mailer.sendFirstLoginEmail({
            username: userToCreate.username,
            email: userToCreate.email,
            link: link,
        });
        if (!mail) {
            return false;
        }
        return user;
    }

    return false;
};

exports.signIn = async (usernameAndPassword) => {
    const details = usernameAndPassword.split(':', 2);
    const username = details[0];
    const password = details[1];

    const user = await userRepository.findByUsername(username);

    if (!user) {
        return 'USERNAME_INVALID';
    }
    if (!password || !bcrypt.compareSync(password, user.password)) {
        return 'PASSWORD_INVALID';
    }

    user.roles = user.roles.map(object => object.role);

    // Find refresh token, generate new one if one doesnt exist
    let refreshToken = await refreshTokenRepository.findByUserId(user.id);
    if (!refreshToken) {
        const date = generateExpiryDate(process.env.REFRESH_TOKEN_EXPIRY)
        const token = uuid();

        const refreshTokenToCreate = {
            token: token,
            expiryDate: date,
            user: user,
        };

        refreshToken = await refreshTokenRepository.create(refreshTokenToCreate);

        if (!refreshToken) {
            return false;
        }
    }

    const token = await generateJWT(user, user.employee.id);
    if (!token) {
        return false;
    }

    return {
        user: user,
        accessToken: token,
        refreshToken: refreshToken
    };
};

exports.findAllUsers = async () => {
    const users = await userRepository.findAll();

    if (!users) {
        return false;
    }

    return users;
};

exports.findUserById = async (id) => {
    const user = await userRepository.findById(id);

    if (!user) {
        return false;
    }

    user.roles = user.roles.map(object => object.role);

    return user;
};

exports.findByUsername = async (username) => {
    const user = await userRepository.findByUsername(username);

    if (!user) {
        return false;
    }

    return user;
};

exports.updateUserRoles = async (id, roles) => {
    const rolesToUpdate = [];

    if (!['USER', 'MODERATOR', 'ADMIN'].contains(roles)) {
        return false;
    }

    for (const role of roles) {
        const result = await roleRepository.findByRole(role);
        rolesToUpdate.push(result);
    }

    if (!rolesToUpdate) {
        return false;
    }

    return await userRepository.updateRoles(id, rolesToUpdate);
};

exports.updateUser = async (user, transaction) => {

    const userToUpdate = {
        id: user.id,
        username: user.username,
        email: user.email,
    };

    return await userRepository.update(userToUpdate, transaction);
};

exports.changePasswordOnNewUser = async (tokenAndPassword) => {
    const transaction = await db.sequelize.transaction();

    const details = tokenAndPassword.split(':', 2);
    const password = details[0];
    const token = details[1];

    const pwToken = await passwordTokenRepository.findByToken(token);

    if (!pwToken) {
        return 'INVALID'
    }

    if (verifyExpiryDate(pwToken.expiryDate)) {
        return 'EXPIRED'
    }

    const newPassword = bcrypt.hashSync(password);

    const userToUpdate = {
        id: pwToken.user.id,
        password: newPassword
    };

    const updatedPassword = await userRepository.updatePasswordOnNewUser(userToUpdate, transaction);
    const deletedToken = await passwordTokenRepository.deleteByToken(token, transaction)

    if (!updatedPassword || !deletedToken) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return {message: 'Successfully changed password!'};
};

exports.changePassword = async (details, loggedInUserId) => {
    if (loggedInUserId !== parseInt(details.id)) {
        throw new AppError('Password could not be updated - invalid permission!', 401, true);
    }

    const password = details.pwAndOldPw.split(':', 2)[0];

    if (password.length <= 9) {
        throw new AppError('Password should be longer than 10 characters', 401, true);
    }

    const oldPw = details.pwAndOldPw.split(':', 2)[1];

    const userPassword = await userRepository.findPasswordById(details.id);
    if (!bcrypt.compareSync(oldPw, userPassword)) {
        throw new AppError('Old password does not match!', 401, true);
    }
    const userToUpdate = {
        id: details.id,
        password: bcrypt.hashSync(password)
    };

    return await userRepository.updatePassword(userToUpdate);
};

exports.deleteUser = async (id) => {
    return await userRepository.delete(id);
};

// ROLES

exports.findAllRoles = async () => {
    return await roleRepository.findAll();
};

exports.findRoleByRole = async (role) => {
    return await roleRepository.findByRole(role);
};


// REFRESH TOKENS

exports.refreshAccessToken = async (token, jwtInfo) => {
    const refreshToken = await refreshTokenRepository.findByToken(token);
    if (!refreshToken) {
        return 'INVALID';
    }

    if (verifyExpiryDate(refreshToken.expiryDate)) {
        await refreshTokenRepository.deleteByToken(token);
        return 'EXPIRED';
    }

    const user = {
        id: jwtInfo.userId,
        roles: jwtInfo.roles,
    };

    const newAccessToken = await generateJWT(user, jwtInfo.employeeId);

    return {
        accessToken: newAccessToken,
        refreshToken: refreshToken.token
    };
};

// PASSWORD TOKENS

const createPasswordToken = async (user, transaction) => {

    const date = generateExpiryDate(process.env.PW_TOKEN_EXPIRY)
    const token = uuid();

    const passwordToken = {
        token: token,
        expiryDate: date,
        userId: user.id,
    };

    return await passwordTokenRepository.create(passwordToken, transaction);
};

exports.updatePwTokenExpiryByUserId = async (userId) => {
    const date = generateExpiryDate(process.env.PW_TOKEN_EXPIRY)
    return await passwordTokenRepository.updateExpiryByUserId(userId, date);
};

// Utility

const generateExpiryDate = (expiryInSeconds) => {
    let expiredAt = new Date();
    expiredAt.setSeconds(
        expiredAt.getSeconds() + parseInt(expiryInSeconds)
    );
    return expiredAt;
};

const verifyExpiryDate = (date) => {
    return date.getTime() < new Date().getTime();
};

const generateUsername = (name) => {
    let randomNumber = Math.floor(Math.random() * 9999) + 1000
    return name.substring(0, 4).toLowerCase() + randomNumber;
};

const generateJWT = (user, employeeId) => {
    return new Promise((resolve) => {
        jwt.sign({id: user.id, roles: user.roles, employeeId: employeeId}, {
            key: key,
            passphrase: process.env.PRIVATE_KEY_PW
        }, {algorithm: 'RS256'}, function (err, token) {
            if (err) {
                throw new AppError(err.message, 500, true);
            }
            resolve(token);
        });
    });
};
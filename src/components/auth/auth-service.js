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
const {logger} = require('../../common/log');
const {mailer} = require('../../common/mailer');
const key = fs.readFileSync('private-key.pem');

const moduleName = 'auth-service.js -';

//TODO: ADD LOGGING MESSAGES

// USERS

exports.createUserForEmployee = async (employee, roles, transaction) => {

    const rolesToAdd = [];

    //TODO PROBABLY NEEDS SOME VALIDAITON OF SOME SORTS
    for (const role of roles) {
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
        await mailer.sendEmail(
            userToCreate.email,
            'Request to reset Password',
            `<h1>Hello new employee!.</h1>
        <br/>
        <p>In order to access the WMS, you must reset your password.<p>
        <br/>
        <p>Please go to LINK HERE and use the following details:<p>
        <br/>
        <br/>
        <h2><strong>USERNAME:</strong> ${userToCreate.username}</h2>
        <br/>
        <h2><strong>TOKEN:</strong> ${passwordToken}</h2>
        <br/>
        <p>For security reasons, your token expires in 24 hours.</p>
        <br/>
        <p>Kind regards</p>`
        );
    }

    return false;
};

exports.signIn = async (body) => {
    const user = await userRepository.findByUsername(body.username);

    if (!user) {
        return 'USERNAME_INVALID';
    }
    if (!bcrypt.compareSync(body.password, user.password)) {
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

    const token = await generateJWT(user);
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
    return await userRepository.findAll();
};

exports.findUserById = async (id) => {
    return await userRepository.findById(id);
};

exports.updateUser = async (id, body) => {

    const userToUpdate = {
        username: body.username,
        email: body.email,
        roles: body
    };

    return await userRepository.update(id, userToUpdate);
};

exports.changePasswordOnNewUser = async (body) => {
    const transaction = await db.sequelize.transaction();

    const pwToken = await passwordTokenRepository.findByToken(body.token);

    if (!pwToken) {
        return 'INVALID'
    }

    if (verifyExpiryDate(pwToken.expiryDate)) {
        return 'EXPIRED'
    }

    const newPassword = bcrypt.hashSync(body.password);

    const updatedPassword = userRepository.updatePasswordByUsername(body.username, newPassword, transaction);
    const deletedToken = passwordTokenRepository.deleteByToken(body.token)

    if (!updatedPassword || !deletedToken) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return {message: 'Successfully changed password!'};
};

exports.changePassword = async (id, body) => {
    const userPassword = await userRepository.findPasswordById(id);
    if (!bcrypt.compareSync(body.oldPassword, userPassword)) {
        return false;
    }

    const newPassword = bcrypt.hashSync(body.password);

    await userRepository.updatePassword(id, newPassword);
};

exports.deleteUser = async (id) => {
    return await userRepository.delete(id);
};

// ROLES

exports.createRole = async (body) => {

    const roleToCreate = {
        role: body.role
    };

    return await roleRepository.create(roleToCreate);
};

exports.findAllRoles = async () => {
    return await roleRepository.findAll();
};

exports.findRoleByRole = async (role) => {
    return await roleRepository.findByRole(role);
};

exports.deleteRole = async (id) => {
    return await roleRepository.delete(id);
};

// REFRESH TOKENS

exports.refreshAccessToken = async (token) => {
    const refreshToken = await refreshTokenRepository.findByToken(token);
    if (!refreshToken) {
        return 'INVALID';
    }

    if (verifyExpiryDate(refreshToken.expiryDate)) {
        await refreshTokenRepository.deleteByToken(token);
        return 'EXPIRED';
    }

    const user = {
        id: refreshToken.user.id,
        roles: refreshToken.user.roles,
        employee: refreshToken.user.employee.employeeId
    };

    const newAccessToken = generateJWT(user);

    return {
        accessToken: newAccessToken,
        refreshToken: refreshToken
    };
};


// PASSWORD TOKENS

const createPasswordToken = async (user, transaction) => {

    const date = generateExpiryDate(process.env.PW_TOKEN_EXPIRY)
    const token = uuid();

    const passwordToken = {
        token: token,
        expiryDate: date,
        user: user,
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
    return name.substring(0, 4) + randomNumber;
};

const generateJWT = (user, next) => {
    return new Promise((resolve) => {
        jwt.sign({id: user.id, roles: user.roles, employeeId: user.employee.id}, {
            key: key,
            passphrase: process.env.PRIVATE_KEY_PW
        }, {algorithm: 'RS256'}, function (err, token) {
            if (err) {
                next(new AppError(err.message, 500, true));
            }
            resolve(token);
        });
    });
};
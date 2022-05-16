const controller = require('./auth-controller');
const service = require('./auth-service');
const Role = require('./role-model');
const User = require('./user-model');
const PasswordToken = require('./passwordtoken-model');
const RefreshToken = require('./refreshtoken-model');
const router = require('./auth-routes');
const roleRepository = require('./role-repository');
const userRepository = require('./user-repository');
const pwTokenRepository = require('./passwordtoken-repository');
const refreshTokenRepository = require('./refreshtoken-repository');


module.exports = {
    controller,
    service,
    Role,
    User,
    PasswordToken,
    RefreshToken,
    router,
    roleRepository,
    userRepository,
    pwTokenRepository,
    refreshTokenRepository,
};
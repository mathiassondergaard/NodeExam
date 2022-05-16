const { apiLimiter, authLimiter } = require('./rate-limiter');
const verifyAuth = require('./verify-auth');

module.exports = {
    apiLimiter,
    authLimiter,
    verifyJwt: verifyAuth.verifyToken,
    modGuard: verifyAuth.modGuard,
    adminGuard: verifyAuth.adminGuard,
};


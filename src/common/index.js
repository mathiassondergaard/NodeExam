const { apiLimiter, authLimiter } = require('./rate-limiter');
const verifyAuth = require('./verify-auth');

module.exports = {
    apiLimiter,
    authLimiter,
    verifyJwt: verifyAuth.verifyToken,
    verifyJwtForSocket: verifyAuth.verifySocketToken,
    modGuard: verifyAuth.modGuard,
    adminGuard: verifyAuth.adminGuard,
};


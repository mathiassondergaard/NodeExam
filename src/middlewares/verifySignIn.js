const bcrypt = require('bcryptjs');
const User = require('../components/authentication/user.model');
const {logger} = require('../helpers/log');
const {AppError} = require("../error");


const moduleName = 'verifySignIn.js -';

signInValidator = async (req, res, next) => {
    logger.info(`${moduleName} validate sign-in-request ${JSON.stringify(req.body.username)}`);
    //Check if username is valid
    const user = await User.findOne({username: req.body.username}).exec();

    if (!user) {
        logger.error(`${moduleName} verify username - username is invalid ${JSON.stringify(req.body.username)}`);
        throw new AppError('Username is not valid!', 404, true);
    }

    //Check if password is valid
    if (!bcrypt.compareSync(req.body.password, user.password)) {
        throw new AppError('Password not valid!', 401, true);
    }

    next();
};

module.exports = signInValidator;
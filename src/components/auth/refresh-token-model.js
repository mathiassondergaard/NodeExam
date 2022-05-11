const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');

const RefreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    expiryDate: {
        type: Date,
        required: true
    },
});

RefreshTokenSchema.statics.createRefreshToken = async (user) => {
    let expiredAt = new Date();
    expiredAt.setSeconds(
        expiredAt.getSeconds() + parseInt(process.env.REFRESH_TOKEN_EXPIRY)
    );
    let _token = uuid();
    let _refreshToken = new this({
        token: _token,
        user: user._id,
        expiryDate: expiredAt.getTime(),
    });
    let refreshToken = await _refreshToken.save();
    return refreshToken.token;
};

// Used for verifying expiry of refresh token
RefreshTokenSchema.statics.verifyRtExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
};

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshToken;

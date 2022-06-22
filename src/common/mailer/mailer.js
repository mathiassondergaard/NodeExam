const nodemailer = require('nodemailer');
const {logger} = require('../log');

const moduleName = 'mailer.js -';

// Define options for sending email
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    //service: process.env.MAIL_SERVICE,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PW
    },
});

module.exports.sendEmail = async (email, subject, html) => {
    // Send the email
    logger.info(`${moduleName} subject: '${subject}' email sent to ${email}`);
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: subject,
        html: html
    })
    .catch((err) => {
        logger.error(`${moduleName} subject: ${subject} email unexpected error ${JSON.stringify(err)}`);
        return false;
    });
    return true;
};

module.exports.sendFirstLoginEmail = async (details) => {
    // Send the email
    logger.info(`${moduleName} first login email sent to ${details.email}`);
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: details.email,
        subject: 'WMS - An account was created for you',
        html: `
        <h1>Hello new employee!</h1>
        <br/>
        <p>In order to access the WMS, you must reset your password.<p>
        <br/>
        <p>Please click the <a rel='external' href=${details.link}>link</a> and use the following details:<p>
        <br/>
        <br/>
        <h2><strong>USERNAME:</strong> ${details.username}</h2>
        <br/>
        <br/>
        <p>For security reasons, your token expires in 24 hours.</p>
        <br/>
        <p>Kind regards</p>`
    })
        .catch((err) => {
            logger.error(`${moduleName} first login email unexpected error ${JSON.stringify(err)}`);
            return false;
        });
    return true;
};


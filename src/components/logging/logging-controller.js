const loggingService = require('./logging-service');
const {logger} = require('../../common/log');
const {AppError} = require('../../error');
const path = require('path');

const moduleName = 'logging-controller.js -';

exports.collectLogs = async (req, res, next) => {
    let date = new Date();
    const zipped = await loggingService.generateLogZip();
    const fileName = `full_logs_${date}.zip`

    if (!zipped) {
        logger.error(`${moduleName} failed to export all logs`);
        return next(new AppError('Failed to export logs!', 500, true));
    }

    const filePath = path.join(__basedir, '/downloads/full_logs.zip');

    logger.info(`${moduleName} successfully exported logs`);
    return res.status(200).download(filePath, fileName);
};
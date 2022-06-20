const {logger} = require('../../common/log');
const BatchLog = require('./batchlog-model');
const {AppError} = require('../../error');

const moduleName = 'batchLog-repository.js -';

exports.create = async (batchLog, transaction) => {
    const _batchLog = await BatchLog.create({
        affectedItemsSKUs: batchLog.affectedItemsSKUs,
        employeeId: batchLog.employeeId,
        note: batchLog.note,
    }, {
        transaction
    });

    if (_batchLog[0] === 0) {
        logger.error(`${moduleName} could not create batchLog`);
        return;
    }

    logger.debug(`${moduleName} created batchLog ${JSON.stringify(_batchLog)}`);

    return true;
};

exports.findAll = async () => {
    const batchLogs = await BatchLog.findAll({});

    if (!batchLogs || batchLogs.length === 0) {
        logger.error(`${moduleName} no batchLogs present in db / db error`);
        throw new AppError('No batchLogs present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all batchLogs successfully`);

    return batchLogs.map(batchlog => batchlog.get({plain: true}));
};

exports.delete = async (id) => {
    const deleted = await BatchLog.destroy({
        where: {
            id: id
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} batchLog to delete not found id: ${id}`);
        throw new AppError(`BatchLog ${id} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete batchLog success, id: ${id}`);
    return {message: `BatchLog ${id} successfully deleted!`};
};

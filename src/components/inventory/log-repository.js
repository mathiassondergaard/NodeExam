const {logger} = require('../../common/log');
const ItemLog = require('./log-model');
const {AppError} = require('../../error');

const moduleName = 'itemLog-repository.js -';

exports.create = async (itemLog, transaction) => {
    const _itemLog = await ItemLog.create({
        SKU: itemLog.SKU,
        employeeId: itemLog.employeeId,
        quantityChanged: itemLog.quantityChanged,
        note: itemLog.note,
    }, {
        transaction
    });

    if (_itemLog[0] === 0) {
        logger.error(`${moduleName} could not create itemLog`);
        return;
    }

    logger.debug(`${moduleName} created itemLog ${JSON.stringify(_itemLog)}`);

    return true;
};

exports.findAll = async () => {
    const itemLogs = await ItemLog.findAll({});

    if (!itemLogs || itemLogs.length === 0) {
        logger.error(`${moduleName} no itemLogs present in db / db error`);
        throw new AppError('No itemLogs present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all itemLogs successfully`);

    return itemLogs.map(itemlog => itemlog.get({plain: true}));
};

exports.delete = async (id) => {
    const deleted = await ItemLog.destroy({
        where: {
            id: id
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} itemLog to delete not found id: ${id}`);
        throw new AppError(`ItemLog ${id} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete itemLog success, id: ${id}`);
    return {message: `ItemLog ${id} successfully deleted!`};
};

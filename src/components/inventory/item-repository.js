const {logger} = require('../../common/log');
const Item = require('./item-model');
const {AppError} = require('../../error');

const moduleName = 'item-repository.js -';

exports.create = async (item) => {
    const _item = await Item.create({
        name: item.name,
        SKU: item.SKU,
        stock: item.stock,
        threshold: item.threshold,
        location: item.location,
    });

    if (_item[0] === 0) {
        logger.error(`${moduleName} could not create item`);
        throw new AppError(`Create item failed`, 500, true);
    }

    logger.debug(`${moduleName} created item ${JSON.stringify(_item)}`);

    return true;
};

//Must have name, SKU, stock, threshold, location with same key/value pair
exports.bulkCreate = async (items) => {
    const _items = await Item.bulkCreate(items);

    if (!items ||_items.length === 0) {
        logger.error(`${moduleName} could not create items`);
        throw new AppError(`Create items failed`, 500, true);
    }

    logger.debug(`${moduleName} created items ${JSON.stringify(_item)}`);

    return _items;
};

exports.findAll = async () => {
    const items = await Item.findAll({});

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present in db / db error`);
        throw new AppError('No items present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all items successfully`);

    return items.map(item => item.get({plain: true}));
};

exports.findBySKUs = async (SKUs) => {
    const items = await Item.findAll({ where: { SKU: SKUs}});

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present in db / db error`);
        throw new AppError('No items present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all items successfully by SKUS ${SKUs}`);

    return items.map(item => item.get({plain: true}));
};

exports.findByIds = async (ids) => {
    const items = await Item.findAll({where: { id: ids}});

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present in db / db error`);
        throw new AppError('No items present in DB!', 404, true);
    }

    logger.debug(`${moduleName} found all items successfully by ids ${ids}`);

    return items.map(item => item.get({plain: true}));
};

exports.findAllWithIncludedAttributes = async (attributes) => {
    const items = await Item.findAll({
        attributes: attributes,
    });

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} found all items successfully with attributes ${attributes}`);

    return items.map(item => item.get({plain: true}));
};

exports.findBySKUsWithIncludedAttributes = async (SKUs, attributes) => {
    const items = await Item.findAll({
        attributes: attributes,
        where: {
            SKU: SKUs,
        }
    });

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} found all items successfully with attributes ${attributes}`);

    return items.map(item => item.get({plain: true}));
};

exports.findByIdsWithIncludedAttributes = async (ids, attributes) => {
    const items = await Item.findAll({
        attributes: attributes,
        where: {
            id: ids,
        }
    });

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} found all items successfully with attributes ${attributes}`);

    return items.map(item => item.get({plain: true}));
};

exports.update = async (id, item) => {
    const _item = await Item.update({
        name: item.name,
        SKU: item.SKU,
        stock: item.stock,
        threshold: item.threshold,
        location: item.location,
    }, {
        where: {
            id: id
        },
    });

    if (!_item || _item[0] === 0) {
        logger.error(`${moduleName} item to update not found id: ${id} / db error`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item, id ${id}: ${JSON.stringify(_item)}`);
    return {message: `Item ${id} successfully updated!`};
};

exports.updateStock = async (id, newStock) => {
    const _item = await Item.update({
        stock: newStock,
    }, {
        where: {
            id: id
        },
    });

    if (!_item || _item[0] === 0) {
        logger.error(`${moduleName} item to update not found id: ${id} / db error`);
        return false;
    }

    logger.debug(`${moduleName} updated item, id ${id}: ${JSON.stringify(_item)}`);
    return {message: `Item ${id} successfully updated!`};
};

exports.updateStockOnMultiple = async (SKUs, itemsToUpdate, transaction) => {
    const items = await Item.findAll({
        attributes: ['SKU', 'stock'],
        where: {
            SKU: SKUs
        }
    });

    if (!items || items.length === 0) {
        logger.error(`${moduleName} failed to fetch items on update item stock`);
        return false;
    }

    const updates = [];

    items.forEach(item => {
        itemsToUpdate.forEach(async (itemToUpdate) => {
            if (item.SKU !== itemToUpdate.SKU) return;
            item.stock -= itemToUpdate.quantityChanged;

            updates.push(Item.update({
                stock: item.stock,
            }, {
                where: {
                    SKU: item.SKU
                },
                transaction
            }));
        });
    });

    const updated = await Promise.all(updates).catch(async () => { return null;});

    if (!updated || updated.length === 0) {
        logger.error(`${moduleName} failed to update item stock`);
        return false;
    }

    logger.debug(`${moduleName} updated item stock by SKUs: ${JSON.stringify(SKUs)}`);

    return true;
};

exports.updateLocation = async (id, newLocation) => {
    const _item = await Item.update({
        location: newLocation,
    }, {
        where: {
            id: id
        },
    });

    if (!_item || _item[0] === 0) {
        logger.error(`${moduleName} item to update not found id: ${id} / db error`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item location, id ${id}: ${JSON.stringify(_item)}`);
    return {message: `Item ${id} location successfully updated!`};
};

exports.findById = async (id) => {
    const item = await Item.findByPk(id);

    if (!item) {
        logger.error(`${moduleName} item ${id} not present in db / db error`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved item by id: ${id} | ${JSON.stringify(item)}`);
    return item.get({plain: true});
};

exports.updateStatus = async (id, status) => {
    const item = await Item.update({
        status: status,
    }, {
        where: {
            id: id
        }
    });

    if (!item || item[0] === 0) {
        logger.error(`${moduleName} item to update status not found id: ${id}`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item status with id ${id}: ${JSON.stringify(status)}`);
    return {message: `Item ${id} status successfully updated! New status: ${status}`};
};

exports.delete = async (id) => {
    const deleted = await Item.destroy({
        where: {
            id: id
        }
    });

    if (deleted !== 1) {
        logger.error(`${moduleName} item to delete not found id: ${id}`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.info(`${moduleName} delete item success, id: ${id}`);
    return {message: `Item ${id} successfully deleted!`};
};

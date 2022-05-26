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

    return {message: 'Item successfully created!'};
};

//Must have name, SKU, stock, threshold, location with same key/value pair
exports.bulkCreate = async (items) => {
    const _items = await Item.bulkCreate(items);

    if (!items ||_items.length === 0) {
        logger.error(`${moduleName} could not create items`);
        throw new AppError(`Create items failed`, 500, true);
    }

    logger.debug(`${moduleName} created items ${JSON.stringify(_item)}`);

    return _items.map(item => item.get({plain: true}));
};

exports.findById = async (id) => {
    const item = await Item.findByPk(id);

    if (!item) {
        logger.error(`${moduleName} Item ${id} not present in db / db error`);
        throw new AppError(`Item ${id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} retrieved item by id: ${id} | ${JSON.stringify(item)}`);
    return item.get({plain: true});
};

exports.findSKUAndStockById = async (id) => {
    const item = await Item.findByPk(id, {attributes: ['SKU', 'stock']});

    if (!item) {
        logger.error(`${moduleName} item ${id} not present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} retrieved item sku and stock by id: ${id} | ${JSON.stringify(item)}`);
    return item.get({plain: true});
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

exports.findBySKUsWithIncludedAttributes = async (options) => {
    const items = await Item.findAll({
        attributes: options.attributes,
        where: {
            SKU: options.SKUs,
        }
    });

    if (!items || items.length === 0) {
        logger.error(`${moduleName} no items present in db / db error`);
        return false;
    }

    logger.debug(`${moduleName} found all items by SKUs ${JSON.stringify(options.SKUs)} successfully with attributes ${options.attributes}`);

    return items.map(item => item.get({plain: true}));
};

exports.update = async (itemToUpdate) => {
    const _item = await Item.update({
        name: itemToUpdate.name,
        SKU: itemToUpdate.SKU,
        threshold: itemToUpdate.threshold,
        location: itemToUpdate.location,
        lastUpdatedBy: itemToUpdate.updatedBy,
    }, {
        where: {
            id: itemToUpdate.id
        },
    });

    if (!_item || _item[0] === 0) {
        logger.error(`${moduleName} item to update not found id: ${itemToUpdate.id} / db error`);
        throw new AppError(`Item ${itemToUpdate.id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item, id ${itemToUpdate.id}: ${JSON.stringify(_item)}`);
    return {message: `Item ${itemToUpdate.id} successfully updated!`};
};

exports.updateStock = async (itemToUpdate, transaction) => {
    const _item = await Item.update({
        stock: itemToUpdate.stock,
        lastUpdatedBy: itemToUpdate.updatedBy,
    }, {
        where: {
            id: itemToUpdate.id
        },
        transaction
    });

    if (!_item || _item[0] === 0) {
        logger.error(`${moduleName} item to update not found id: ${itemToUpdate.id} / db error`);
        return false;
    }

    logger.debug(`${moduleName} updated item, id ${itemToUpdate.id}: new stock: ${JSON.stringify(itemToUpdate.stock)}`);
    return {message: `Item ${itemToUpdate.id} successfully updated!`};
};

exports.updateStockOnMultiple = async (itemsToUpdate, transaction) => {

    const updates = itemsToUpdate.items.map(i => Item.update(
        { stock: i.stock, lastUpdatedBy: itemsToUpdate.updatedBy },
        { where: { SKU: i.SKU}, transaction }
    ));

    const updated = await Promise.all(updates).catch(async () => { return null;});

    if (!updated || updated.length === 0) {
        logger.error(`${moduleName} failed to update item stock`);
        return false;
    }

    logger.debug(`${moduleName} updated item stock by SKUs: ${JSON.stringify(itemsToUpdate.SKUs)}`);

    return true;
};

exports.updateLocation = async (itemToUpdate) => {
    const _item = await Item.update({
        location: itemToUpdate.location,
        lastUpdatedBy: itemToUpdate.updatedBy,
    }, {
        where: {
            id: itemToUpdate.id
        },
    });

    if (!_item || _item[0] === 0) {
        logger.error(`${moduleName} item to update not found id: ${itemToUpdate.id} / db error`);
        throw new AppError(`Item ${itemToUpdate.id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item location, id ${itemToUpdate.id}: new location: ${JSON.stringify(itemToUpdate.location)}`);
    return {message: `Item ${itemToUpdate.id} location successfully updated!`};
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

exports.updateStatus = async (itemToUpdate) => {
    const item = await Item.update({
        status: itemToUpdate.status,
        lastUpdatedBy: itemToUpdate.updatedBy,
    }, {
        where: {
            id: itemToUpdate.id
        }
    });

    if (!item || item[0] === 0) {
        logger.error(`${moduleName} item to update status not found id: ${itemToUpdate.id}`);
        throw new AppError(`Item ${itemToUpdate.id} not found!`, 404, true);
    }

    logger.debug(`${moduleName} updated item status with id ${itemToUpdate.id}: ${JSON.stringify(itemToUpdate.status)}`);
    return {message: `Item ${itemToUpdate.id} status successfully updated! New status: ${itemToUpdate.status}`};
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

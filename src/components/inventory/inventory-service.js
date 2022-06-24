const path = require('path');

const {AppError} = require('../../error');
const logRepository = require('./log-repository');
const itemRepository = require('./item-repository');
const batchLogRepository = require('./batchlog-repository');
const fileTools = require('./file-tools');
const db = require("../../db");

// INVENTORY

exports.createItem = async (item) => {

    const itemToCreate = {
        name: item.name,
        SKU: item.SKU,
        stock: item.stock,
        status: checkStatus(item.stock, item.threshold),
        threshold: item.threshold,
        location: item.location,
    };

    return await itemRepository.create(itemToCreate);
};

exports.findAllItems = async () => {
    return await itemRepository.findAll();
};

exports.findItemById = async (id) => {
    return await itemRepository.findById(id);
};

exports.updateItem = async (itemToUpdate) => {
    itemToUpdate.status = checkStatus(itemToUpdate.stock, itemToUpdate.threshold);
    return await itemRepository.update(itemToUpdate);
};

exports.updateStock = async (itemToUpdate) => {
    const transaction = await db.sequelize.transaction();

    const SKUThresholdAndStock = await itemRepository.findSKUThresholdAndStockById(itemToUpdate.id);

    if (!SKUThresholdAndStock) {
        return false;
    }

    itemToUpdate.status = checkStatus(itemToUpdate.stock, SKUThresholdAndStock.threshold)

    const itemLog = {
        SKU: SKUThresholdAndStock.SKU,
        employeeId: itemToUpdate.updatedBy,
        quantityChanged: calculateAmountChanged(itemToUpdate.stock, SKUThresholdAndStock.stock),
        note: itemToUpdate.note,
    };

    const updatedStock = await itemRepository.updateStock(itemToUpdate, transaction);
    const createdLog = await logRepository.create(itemLog, transaction);

    if (!updatedStock || !createdLog) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return updatedStock;
};

exports.updateLocation = async (itemToUpdate) => {
    return await itemRepository.updateLocation(itemToUpdate);
};

exports.delete = async (id) => {
    return await itemRepository.delete(id);
};

exports.importInventoryList = async (filename) => {
    let filePath = path.join(__basedir, '/resources/uploads/', filename);

    const items = await fileTools.readCsv(filePath, {delimiter: ';', headers: true});
    const SKUs = [];
    validateCsvHeaders(['name', 'SKU', 'stock', 'threshold', 'location'], Object.keys(items[0]))

    items.forEach(i => {
        if (typeof i.stock === 'string') {
            i.stock = parseInt(i.stock);
        }
        if (typeof i.threshold === 'string') {
            i.stock = parseInt(i.threshold);
        }
        SKUs.push(i.SKU);
        i.status = checkStatus(i.stock, i.threshold);
    });

    const createdItems = await itemRepository.bulkCreate(items);

    if (!createdItems) {
        return false;
    }

    await fileTools.deleteFile(filePath);

    return await itemRepository.findBySKUs(SKUs);
};

exports.updateStockByCSV = async (body) => {
    const transaction = await db.sequelize.transaction();
    let filePath = path.join(__basedir, '/resources/uploads/', body.filename);

    let itemsToUpdate = {
        items: await fileTools.readCsv(filePath, {delimiter: ';', headers: true}),
        updatedBy: body.updatedBy,
    };

    // STATUS NOT UPDATING CORRECTLY
    const items = await itemRepository.findBySKUsWithIncludedAttributes({SKUs: itemsToUpdate.items.map(i => i.SKU), attributes: ['SKU', 'threshold']});

    if (!items) {
        return false;
    }

    validateCsvHeaders(['SKU', 'stock'], Object.keys(itemsToUpdate.items[0]))

    // used because csv parser sometimes returns stock as string
    itemsToUpdate.items.forEach(i => {
        if (typeof i.stock === 'string') {
            i.stock = parseInt(i.stock);
        }
        if (typeof i.threshold === 'string') {
            i.stock = parseInt(i.threshold);
        }
        items.forEach(x => {
            if (i.SKU === x.SKU) {
                i.status = checkStatus(i.stock, x.threshold);
            }
        });
    });

    const batchLog = {
        affectedItemsSKUs: itemsToUpdate.items.map(i => i.SKU),
        employeeId: body.updatedBy,
        note: body.note,
    };

    const updatedItems = await itemRepository.updateStockOnMultiple(itemsToUpdate, transaction);
    const createdBatchLog = await batchLogRepository.create(batchLog, transaction);

    if (!updatedItems || !createdBatchLog) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();
    await fileTools.deleteFile(filePath);

    return updatedItems;
};

exports.exportInventoryList = async () => {
    const items = await itemRepository.findAll();

    const csvFile = await fileTools.generateCsvFile(Object.keys(items[0]), items);

    if (!csvFile) {
        return false;
    }

    return csvFile;
};

exports.exportInventoryListWithPickedAttributes = async (attributes) => {
    attributes = attributes.map(attrib => {if (attrib === "sku") { return attrib.toUpperCase();} else if (attrib === "updated by") { return "lastUpdatedBy"} else return attrib})
    const items = await itemRepository.findAllWithIncludedAttributes(attributes);

    const csvFile = await fileTools.generateCsvFile(Object.keys(items[0]), items);

    if (!csvFile) {
        return false;
    }

    return csvFile;
};

exports.exportPickedInventoryList = async (options) => {
    options.attributes = options.attributes.map(attrib => {if (attrib === "sku") { return attrib.toUpperCase();} else if (attrib === "updated by") { return "lastUpdatedBy"} else return attrib})

    const items = await itemRepository.findBySKUsWithIncludedAttributes(options);

    const csvFile = await fileTools.generateCsvFile(Object.keys(items[0]), items);

    if (!csvFile) {
        return false;
    }

    return csvFile;
};

// INVENTORY LOGS

exports.findAllItemLogs = async () => {
    return await logRepository.findAll();
};

exports.deleteItemLog = async (id) => {
    return await logRepository.delete(id);
};

exports.findAllBatchLogs = async () => {
    const batchLogs = await batchLogRepository.findAll();

    batchLogs.forEach(i => {
        let SKUs = '';
        i.affectedItemsSKUs.forEach(x => {
            x.replace(',', ' ');
            SKUs += x + ' ';
        });
        i.affectedItemsSKUs = SKUs;
    });

    return batchLogs;
};

exports.deleteBatchLog = async (id) => {
    return await batchLogRepository.delete(id);
};

// Helper

const calculateAmountChanged = (newStock, oldStock) => {
    if (typeof newStock === "string") {
        newStock = parseInt(newStock);
    }
    let amountChanged = '';

    if (newStock > oldStock) {
        amountChanged = `+${newStock - oldStock}`;
    }
    else if (newStock < oldStock) {
        amountChanged = `-${oldStock - newStock}`;
    }
    else if (newStock === oldStock) {
        amountChanged = 'No change';
    }

    return amountChanged;
};

const validateCsvHeaders = (validation, headers) => {
    headers.forEach(i => {
        if (!validation.includes(i)) {
            throw new AppError('CSV File is invalid', 500, true);
        }
    });
};

const checkStatus = (stock, threshold) => {
    if (inRange(stock, threshold, threshold+5)) {
        return 'CAUTION';
    }
    else if (stock < threshold) {
        return 'CRITICAL';
    }
    else {
        return 'HEALTHY';
    }
}

const inRange = (x, min, max) => {
    return ((x-min)*(x-max) <= 0);
}

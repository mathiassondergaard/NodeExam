const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const CsvParser = require('json2csv').Parser;

const {AppError} = require('../../error');
const logRepository = require('./log-repository');
const itemRepository = require('./item-repository');
const batchLogRepository = require('./batchlog-repository');
const db = require("../../db");

// INVENTORY

exports.createItem = async (item) => {

    const itemToCreate = {
        name: item.name,
        SKU: item.SKU,
        stock: item.stock,
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
    return await itemRepository.update(itemToUpdate);
};

exports.updateStock = async (itemToUpdate) => {
    const transaction = await db.sequelize.transaction();

    const SKUAndStock = await itemRepository.findSKUAndStockById(itemToUpdate.id);

    if (!SKUAndStock) {
        return false;
    }

    const itemLog = {
        SKU: SKUAndStock.SKU,
        employeeId: itemToUpdate.updatedBy,
        quantityChanged: calculateAmountChanged(itemToUpdate.stock, SKUAndStock.stock),
        note: itemToUpdate.note,
    };

    const updatedStock = await itemRepository.updateStock(itemToUpdate, transaction);
    const createdLog = await logRepository.create(itemLog, transaction);

    if (!updatedStock || createdLog) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return true;
};

const calculateAmountChanged = (newStock, oldStock) => {
    let amountChanged = '';
    switch (newStock) {
        case newStock > oldStock:
            amountChanged = `+ ${newStock -= oldStock}`;
            break;
        case newStock < oldStock:
            amountChanged = `- ${oldStock -= newStock}`;
            break;
        case newStock === oldStock:
            amountChanged = 'No change';
            break;
    }
    return amountChanged;
};

exports.updateLocation = async (itemToUpdate) => {
    return await itemRepository.updateLocation(itemToUpdate);
};

exports.updateStatus = async (itemToUpdate) => {
    const statusValidation = ['HEALTHY', 'CAUTION', 'CRITICAL'];

    if (!statusValidation.contains(itemToUpdate.status.toUpperCase())) {
        return false;
    }

    return await itemRepository.updateStatus(itemToUpdate);
};

exports.delete = async (id) => {
    return await itemRepository.delete(id);
};

exports.updateStockByCSV = async (body) => {
    const transaction = await db.sequelize.transaction();
    let filePath = path.join(__basedir, '/uploads/', body.csvFileName);
    const parser = csv.parse({ headers: true });
    const stream = fs.createReadStream(filePath);

    let itemsToUpdate = {
        items: [],
        updatedBy: body.updatedBy,
    };

    stream.pipe(parser)
        .on('error', () => {
            throw new AppError('Error during CSV Parsing', 500, true);
        })
        .on('data', (row) => {
            itemsToUpdate.items.push(row);
        })
        .on('end', () => {
            stream.destroy();
        })
        .on('close', () => {
            console.log('Destroyed stream and closed file!'); //replace with logger
            fs.unlinkSync(filePath);
            parser.end();
            stream.unpipe(parser);
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

    return {message: 'Successfully updated items by CSV'};
};

exports.exportInventoryList = async () => {
    const items = await itemRepository.findAll();

    const csvFile = generateCsvFile(Object.keys(items[0]), items);

    if (!csvFile) {
        return false;
    }

    return csvFile;
};

exports.exportInventoryListWithPickedAttributes = async () => {
    // find all and include picked attributes, validate it
};

exports.exportPickedInventoryList = async (options) => {
    const items = await itemRepository.findBySKUsWithIncludedAttributes(options);

    const csvFile = generateCsvFile(Object.keys(items[0]), items);

    if (!csvFile) {
        return false;
    }

    return csvFile;
};

exports.exportPackingList = async () => {

};

const generateCsvFile = (fields, data) => {
    try {
        const parser = new CsvParser(fields);
        return parser.parse(data);
    } catch (err) {
        return false;
    }
};

// INVENTORY LOGS

exports.findAllItemLogs = async () => {
    return await logRepository.findAll();
};

exports.findItemLogById = async (id) => {
    return await logRepository.findById(id);
};

exports.deleteItemLog = async (id) => {
    return await logRepository.delete(id);
};

exports.findAllBatchLogs = async () => {
    return await batchLogRepository.findAll();
};

exports.findBatchLogById = async (id) => {
    return await batchLogRepository.findById(id);
};

exports.deleteBatchLog = async (id) => {
    return await batchLogRepository.delete(id);
};



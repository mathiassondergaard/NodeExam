const inventoryService = require('./inventory-service');
const {logger} = require('../../common/log');
const {AppError} = require('../../error');
const path = require('path');
const socket = require('../../server');

const moduleName = 'inventory-controller.js -';

// HTTP

exports.create = async (req, res, next) => {

    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    const created = await inventoryService.createItem(req.body);

    if (!created) {
        logger.error(`${moduleName} failed to create item`);
        return next(new AppError('Failed to create items!', 500, true));
    }

    logger.info(`${moduleName} successfully created item ${JSON.stringify(created)}`);
    return res.status(201).send(created);

};

exports.findAll = async (req, res, next) => {
    const items = await inventoryService.findAllItems();

    if (!items) {
        logger.error(`${moduleName} failed to find all items`);
        return next(new AppError('Failed to find items!', 500, true));
    }

    logger.info(`${moduleName} successfully found all items`);
    return res.status(200).send(items);

};

exports.findById = async (req, res, next) => {

    const item = await inventoryService.findItemById(req.params.id);

    if (!item) {
        logger.error(`${moduleName} failed to find item`);
        return next(new AppError('Failed to find items!', 500, true));
    }

    logger.info(`${moduleName} successfully found item ${req.params.id}`);
    return res.status(200).send(item);

};

exports.exportInventoryListWithPickedAttributes = async (req, res, next) => {

    const inventoryList = await inventoryService.exportInventoryListWithPickedAttributes(req.body.attributes);

    if (!inventoryList) {
        logger.error(`${moduleName} failed to export inventory list ${req.body.attributes}`);
        return next(new AppError('Failed to export inventory list!', 500, true));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=inventory-list.csv");

    logger.info(`${moduleName} successfully exported inventory list ${req.body.attributes}`);
    return res.status(200).send(inventoryList);

};

exports.bulkCreateFromFile = async (req, res, next) => {
    if (!req.file || !validateFile(req.file.filename)) {
        return next(new AppError('Invalid file extension / no file uploaded!', 400, true));
    }

    const item = await inventoryService.importInventoryList(req.file.filename);

    if (!item) {
        logger.error(`${moduleName} failed to find item`);
        return next(new AppError('Failed to find items!', 500, true));
    }

    logger.info(`${moduleName} successfully found item ${req.params.id}`);
    return res.status(201).send(item);

};

exports.exportFullInventoryList = async (req, res, next) => {

    const inventoryList = await inventoryService.exportInventoryList();

    if (!inventoryList) {
        logger.error(`${moduleName} failed to export inventory list`);
        return next(new AppError('Failed to export inventory list!', 500, true));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=inventory-list.csv");

    logger.info(`${moduleName} successfully found exported inventory list`);
    return res.status(200).send(inventoryList);

};

exports.exportPickedInventoryList = async (req, res, next) => {

    const inventoryList = await inventoryService.exportPickedInventoryList(req.body);

    if (!inventoryList) {
        logger.error(`${moduleName} failed to export inventory list ${JSON.stringify(req.body.SKUs)} ${JSON.stringify(req.body.attributes)}`);
        return next(new AppError('Failed to export inventory list', 500, true));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=inventory-list.csv");

    logger.info(`${moduleName} successfully found export inventory list ${JSON.stringify(req.body.SKUs)} ${JSON.stringify(req.body.attributes)}`);
    return res.status(200).send(inventoryList);

};

exports.exportTemplateForBulkCreate = async (req, res) => {
    const filePath = path.join(__basedir, '/resources/downloads/templates/', 'template-for-bulkcreate.xlsx');
    const fileName = 'bulkcreate-template.xlsx';

    logger.info(`${moduleName} successfully sent template file`);
    return res.status(200).download(filePath, fileName);
};

// Sockets

// Do a check on status every 15 minutes, based on threshold
setInterval(async () => {
    const items = await inventoryService.pollAndUpdateStatusBasedOnThreshold();
    logger.info(`${moduleName} polled and updated status based on threshold`);
    socket.ioInstance.emit('status-poll', items);
}, 900000);

exports.updateStockByFile = async (req, res, next) => {
    if (!req.file || !validateFile(req.file.filename)) {
        return next(new AppError('Invalid file / no file uploaded!', 400, true));
    }

    const options = {
        filename: req.file.filename,
        updatedBy: req.employeeId,
        note: req.body.note,
    };

    const updated = await inventoryService.updateStockByCSV(options);

    if (!updated) {
        logger.error(`${moduleName} failed to update stock by csv file ${req.file.filename}`);
        return next(new AppError('Failed to find items!', 500, true));
    }

    socket.ioInstance.emit('updated-stock-bulk', updated);

    logger.info(`${moduleName} successfully updated item by csv`);
    return res.status(200).send(updated);
};

exports.delete = async (req, res, next) => {
    const deleted = await inventoryService.delete(req.params.id);

    if (!deleted) {
        logger.error(`${moduleName} failed to delete item`);
        return next(new AppError('Failed to delete items!', 500, true));
    }

    socket.ioInstance.emit('deleted-item', req.params.id);

    logger.info(`${moduleName} successfully deleted item ${req.params.id}`);
    return res.sendStatus(200);
};

exports.updateItem = async (req, res, next) => {
    const itemToUpdate = {
        id: req.params.id,
        name: req.body.name,
        SKU: req.body.SKU,
        stock: req.body.stock,
        threshold: req.body.threshold,
        location: req.body.location,
        updatedBy: req.employeeId,
    };

    const updated = await inventoryService.updateItem(itemToUpdate);

    if (!updated) {
        logger.error(`${moduleName} failed to update item ${req.params.id}`);
        return next(new AppError('Failed to update items!', 500, true));
    }

    socket.ioInstance.emit('updated-item', updated);

    logger.info(`${moduleName} successfully updated item ${req.params.id}`);
    return res.status(200).send(updated);
};

exports.updateItemLocation = async (req, res, next) => {
    const itemToUpdate = {
        id: req.params.id,
        location: req.body.location,
        updatedBy: req.employeeId,
    };
    const updated = await inventoryService.updateLocation(itemToUpdate);

    if (!updated) {
        logger.error(`${moduleName} failed to update item location ${JSON.stringify(req.body)}`);
        return next(new AppError('Failed to delete items!', 500, true));
    }

    socket.ioInstance.emit('updated-item-location', updated);

    logger.info(`${moduleName} successfully updated item location ${JSON.stringify(req.params.id)}`);
    return res.status(200).send(updated);
};

exports.updateItemStock = async (req, res, next) => {

    const itemToUpdate = {
        id: req.params.id,
        stock: req.body.stock,
        updatedBy: req.employeeId,
        note: req.body.note
    };

    const updated = await inventoryService.updateStock(itemToUpdate);

    if (!updated) {
        logger.error(`${moduleName} failed to update item stock ${JSON.stringify(req.body)}`);
        return next(new AppError('Failed to update items stock!', 500, true));
    }

    socket.ioInstance.emit('updated-item-stock', updated);

    logger.info(`${moduleName} successfully updated item stock ${JSON.stringify(req.params.id)}`);
    return res.status(200).send(updated);
};

// Inventory logs

exports.deleteItemLog = async (req, res, next) => {
    const deleted = await inventoryService.deleteItemLog(req.params.id);

    if (!deleted) {
        logger.error(`${moduleName} failed to delete item log ${req.params.id}`);
        return next(new AppError('Failed to delete items log!', 500, true));
    }

    logger.info(`${moduleName} successfully deleted item log ${JSON.stringify(req.params.id)}`);
    return res.status(200).send(deleted);
};

exports.findAllItemLogs = async (req, res, next) => {
    const itemLogs = await inventoryService.findAllItemLogs();

    if (!itemLogs) {
        logger.error(`${moduleName} failed to find all item logs`);
        return next(new AppError('Failed to find items logs!', 500, true));
    }

    logger.info(`${moduleName} successfully found all item logs`);
    return res.status(200).send(itemLogs);

};

exports.deleteBatchLog = async (req, res, next) => {
    const deleted = await inventoryService.deleteBatchLog(req.params.id);

    if (!deleted) {
        logger.error(`${moduleName} failed to delete batch log ${req.params.id}`);
        return next(new AppError('Failed to delete batch log!', 500, true));
    }

    logger.info(`${moduleName} successfully deleted batch log ${JSON.stringify(req.params.id)}`);
    return res.status(200).send(deleted);
};

exports.findAllBatchLogs = async (req, res, next) => {
    const batchLogs = await inventoryService.findAllBatchLogs();

    if (!batchLogs) {
        logger.error(`${moduleName} failed to find all batch logs`);
        return next(new AppError('Failed to find batch logs!', 500, true));
    }

    logger.info(`${moduleName} successfully found all batch logs`);
    return res.status(200).send(batchLogs);
};

// Helper

const validateFile = (filename) => {
    const fileExtension = filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
    return fileExtension === 'csv';
};

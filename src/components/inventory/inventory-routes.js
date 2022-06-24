const controller = require('./inventory-controller');
const router = require('express').Router();
const {apiLimiter, adminGuard, verifyJwt} = require('../../common');
const upload = require('./file-tools').upload;
const { asyncHandler } = require('../../error');

module.exports = (app) => {
    //app.use(apiLimiter);

    app.use((req, res, next) => {
        res.header(
            "Access-Control-Allow-Headers",
            "Bearer, Origin, Content-Type, Accept"
        );
        next();
    });

    // Items

    router.get('/items', asyncHandler(verifyJwt), asyncHandler(controller.findAll));

    router.post('/items', asyncHandler(verifyJwt), asyncHandler(controller.create));

    router.get('/items/:id', asyncHandler(verifyJwt), asyncHandler(controller.findById));

    router.delete('/items/:id', [
        asyncHandler(verifyJwt),
        adminGuard
    ], asyncHandler(controller.delete));

    router.get('/download/full-list', asyncHandler(verifyJwt), asyncHandler(controller.exportFullInventoryList));

    router.post('/download/picked-attributes', asyncHandler(verifyJwt), asyncHandler(controller.exportInventoryListWithPickedAttributes));

    router.post('/download/picked-list', asyncHandler(verifyJwt), asyncHandler(controller.exportPickedInventoryList));

    router.get('/download/template', asyncHandler(verifyJwt), asyncHandler(controller.exportTemplateForBulkCreate));

    router.put('/upload/stock', asyncHandler(verifyJwt), upload.single('stock-list'), asyncHandler(controller.updateStockByFile));

    router.post('/upload/list', asyncHandler(verifyJwt), upload.single('inventory-list'), asyncHandler(controller.bulkCreateFromFile));

    router.put('/items/:id', asyncHandler(verifyJwt), asyncHandler(controller.updateItem));

    router.patch('/items/:id/location', asyncHandler(verifyJwt), asyncHandler(controller.updateItemLocation));

    router.patch('/items/:id/stock', asyncHandler(verifyJwt), asyncHandler(controller.updateItemStock));

    // Logs

    router.get('/logs', asyncHandler(verifyJwt), asyncHandler(controller.findAllItemLogs));

    router.delete('/logs/:id', [
        asyncHandler(verifyJwt),
        adminGuard
    ], asyncHandler(controller.deleteItemLog));

    router.get('/batch-logs', asyncHandler(verifyJwt), asyncHandler(controller.findAllBatchLogs));

    router.delete('/batch-logs/:id', [
        asyncHandler(verifyJwt),
        adminGuard
    ], asyncHandler(controller.deleteBatchLog));

    app.use('/api/resources/inventory', router);
};

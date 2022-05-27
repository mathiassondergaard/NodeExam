const express = require('express')
const {errorHandler} = require("./error");
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const {router: employeeRouter} = require('./components/employees');
const {router: taskRouter} = require('./components/tasks');
const {router: authRouter} = require('./components/auth');
const {router: loggingRouter} = require('./components/logging');
const {router: inventoryRouter} = require('./components/inventory');
const path = require("path");
const {verifyJwtForSocket} = require('./common');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

const getSocketIoInstance = () => {
    return io;
};

// Sync models to DB
db.sequelize.sync().then(() => console.log(`Successfully synced DB models`));

// Socket.io
io.use(async (socket, next) => {
    if (!socket.handshake.query || !socket.handshake.query.token){
        console.log('Authentication failed');
        next(new Error('No token submitted!'));
    }
    const isVerified = await verifyJwtForSocket(socket.handshake.query.token);
    if (!isVerified) {
        console.log('Authentication failed');
        return next(new Error('Token is invalid!'));
    }
    socket.decoded = isVerified;
    next();
}).on('connection', (socket) => {
    console.log(`Employee ${socket.decoded.employeeId} connected to WMS socket`);

    socket.on('disconnect', () => {
        console.log(`Employee ${socket.decoded.employeeId} disconnected from WMS socket`);
    });
});

// Root project directory path
global.__basedir = path.resolve(__dirname, '..');

let corsOptions = {
    origin: ''
};

if (process.env.RESOURCE_PORT) {
    corsOptions.origin = 'http://localhost:3001';
} else {
    corsOptions.origin = 'http://localhost:8081';
}

app.use(cors(corsOptions));

// content types
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
authRouter(app);
taskRouter(app);
employeeRouter(app);
inventoryRouter(app, getSocketIoInstance);
loggingRouter(app);

// Error Handler
app.use(errorHandler);

process.on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
});

// Init
const PORT = process.env.WMS_PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`WMS server running on port ${PORT}.`);
});

module.exports = {
    io,
};
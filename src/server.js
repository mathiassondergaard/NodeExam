const express = require('express')
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
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
const {createServer} = require("http");
const {Server} = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

// Sync models to DB
db.sequelize.sync().then(() => console.log(`Successfully synced DB models`));

// Socket.io
io.use(async (socket, next) => {
    let cookies = socket.handshake.headers.cookie;

    if (!io.users) {
        io.users = [];
    }

    if (!cookies) {
        return;
    }

    const isVerified = await verifyJwtForSocket(cookie.parse(socket.handshake.headers.cookie).jwt);
    if (!isVerified) {
        console.log('Authentication failed');
        socket.emit('invalid-token', 'Token for socket connection is invalid!');
        return;
    }
    socket.decoded = isVerified;
    io.users.push({employeeId: isVerified.employeeId, socket: socket.id});

    next();
});
io.on('connection', (socket) => {
    console.log(`Employee ${socket.decoded.employeeId} connected to WMS socket`);

    socket.on('disconnect', () => {
        io.users = io.users.filter((i) => i.employeeId !== socket.decoded.employeeId);
        console.log(`Employee ${socket.decoded.employeeId} disconnected from WMS socket`);
    });
});

// Root project directory path
global.__basedir = path.resolve(__dirname, '..');

app.use(cors({
    origin : [ 'http://localhost:5002' , 'http://localhost:5002/', '127.0.0.1:5002' ],
    methods:["GET" , "POST" , "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.options('*', cors());

// content types
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// cookie parser
app.use(cookieParser());

// Routes
authRouter(app);
taskRouter(app);
employeeRouter(app);
inventoryRouter(app);
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

module.exports.ioInstance = io;
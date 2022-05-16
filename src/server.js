const express = require('express')
const {errorHandler} = require("./error");
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const {router: employeeRouter} = require('./components/employees');
const {router: taskRouter} = require('./components/tasks');
const {router: authRouter} = require('./components/auth');

const app = express();

// Sync models to DB
db.sequelize.sync().then(() => console.log(`Successfully synced DB models`));

/*
db.sequelize.sync({ force: true }).then(() => {
    console.log("Please drop and re-sync DB");
});
*/

let corsOptions = {
    origin: ''
};

if (process.env.RESOURCE_PORT) {
    corsOptions.origin = 'http://localhost:3006';
} else {
    corsOptions.origin = 'http://localhost:8088';
}

app.use(cors(corsOptions));

// content types
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
authRouter(app);
taskRouter(app);
employeeRouter(app);

// Error Handler
app.use(errorHandler);

// Init
const PORT = process.env.WMS_PORT || 8087;
app.listen(PORT, () => {
    console.log(`WMS server running on port ${PORT}.`);
});
const express = require("express");
const cors = require("cors");
require('dotenv').config({ path: '.env' })
const { CONFIG_CORS, SERVER_CONFIG } = require("../configs/config");
const { routeNotFound, errorHandlerApp } = require('./middlewares/defaultHandlers.middleware')
const logger = require("./middlewares/logger.middleware");

const app = express();

if (Boolean(Number(SERVER_CONFIG.logger))) {
    app.use(logger)
}

const apiv1 = require("./routes/v1/");
//LOADERS
app.disable('x-powered-by')
app.use(cors(CONFIG_CORS));

//SETTINGS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//API
app.use('/api/v1', apiv1)

app.use([errorHandlerApp, routeNotFound])

module.exports = app;

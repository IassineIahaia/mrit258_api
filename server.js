require('dotenv').config();
const express = require('express');
require('./config/database');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const server = express();

server.use(cors());
server.use(express.json());
server.use(fileUpload());

server.use(express.static('public'));

const apiRouter = require('./src/routers');

server.use('/', apiRouter);

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


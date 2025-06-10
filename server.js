require('dotenv').config();
const express = require('express');
require('./config/database');
const cors = require('cors');

const server = express();

server.use(express.json());
server.use(cors());
server.use(express.urlencoded({ extended: true }));

server.use(express.static('public'));

const apiRouter = require('./src/routers');
server.use('/', apiRouter);

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

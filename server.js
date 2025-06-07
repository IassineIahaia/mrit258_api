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

server.get('/ping', (req, res) => {
    res.json({pong: true});
});

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


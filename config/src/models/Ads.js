const mongoose = require('mongoose');

const adsSchema = new mongoose.Schema({
    idUser: {
        type: String
    },
    state: {
        type: String
    },
    category: {
        type: String
    },
    images: [Object],
    dateCreated: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String
    },
    price: {
        type: Number
    },
    priceNegotiable: {
        type: Boolean
    },
    description: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String
    }
});

module.exports = mongoose.model('Ads', adsSchema);
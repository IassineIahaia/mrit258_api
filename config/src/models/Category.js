const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    state: {
        type: String
    },
    slug: {
        type: String
    }
});

module.exports = mongoose.model('Category', categorySchema);
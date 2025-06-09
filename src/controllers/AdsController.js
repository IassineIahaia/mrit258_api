const Category = require('../models/Category');
const User = require('../models/User');
const Ad = require('../models/Ads'); // <== Certifique-se de importar isso
const mongoose = require('mongoose');

module.exports = {
    getCategories: async (req, res) => {
        try {
            let cats = await Category.find();
         
            let categories = [];
            for (let cat of cats) {
                categories.push({
                    ...cat.toObject(),
                    img: `${process.env.BASE}/assets/images/${cat.slug}.png`
                });
            }

            res.json({ categories });

        } catch (err) {
            res.status(500).json({ error: 'Server error', details: err.message });
        }
    },

  addAction: async (req, res) => {
    let { title, description, price, priceNegotiable, cats, token, state } = req.body;

    if (!title || !cats) {
        return res.status(400).json({ error: 'Title and categories are required' });
    }

    const user = await User.findOne({ token }).exec();
    if (!user) {
        return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(cats)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    price = price ? parseFloat(price) : 0;
    priceNegotiable = priceNegotiable === 'true' || priceNegotiable === true;

    // Processamento das imagens
    let images = [];
    if (req.files && req.files.length > 0) {
        images = req.files.map(file => ({
            url: `${process.env.BASE}/media/${file.filename}`,
            default: false
        }));
        images[0].default = true; // primeira imagem como principal
    }

    const ad = new Ad({
        title,
        description,
        price,
        priceNegotiable,
        category: cats,
        idUser: user._id,
        state: state || '',   // caso queira salvar o estado
        dateCreated: new Date(),
        images
    });

    try {
        await ad.save();
        res.json({ success: true, ad });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
},

    getList: async (req, res) => {
        // Implementar a lógica aqui
    },

    getItem: async (req, res) => {
        // Implementar a lógica aqui
    },

    editAction: async (req, res) => {
        // Implementar a lógica aqui
    }
};

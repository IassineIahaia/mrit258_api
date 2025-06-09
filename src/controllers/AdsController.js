const Category = require('../models/Category');

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

    editAction: async (req, res) => {
        // Implementar a lógica aqui
    },

    getList: async (req, res) => {
        // Implementar a lógica aqui
    },

    getItem: async (req, res) => {
        // Implementar a lógica aqui
    }
};

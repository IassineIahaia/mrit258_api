const Category = require('../models/Category');
const User = require('../models/User');
const Ad = require('../models/Ads');
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
        try {
            let { title, description, price, priceNegotiable, cats, token, state } = req.body;

            console.log('=== DEBUG ADDACTION ===');
            console.log('Dados recebidos:', { title, description, price, priceNegotiable, cats, token, state });
            console.log('Arquivos recebidos:', req.files ? req.files.length : 0);
            console.log('Headers:', req.headers);

            // Validações básicas
            if (!title || !cats) {
                return res.status(400).json({ 
                    error: 'Title and categories are required',
                    received: { title: !!title, cats: !!cats }
                });
            }

            const user = await User.findOne({ token }).exec();
            if (!user) {
                return res.status(401).json({ error: 'Invalid token or user not found' });
            }

            if (!mongoose.Types.ObjectId.isValid(cats)) {
                return res.status(400).json({ error: 'Invalid category ID' });
            }

            // Conversões seguras
            price = price ? parseFloat(price) : 0;
            priceNegotiable = priceNegotiable === 'true' || priceNegotiable === true;

            // ✅ Processamento robusto das imagens
            let images = [];
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                console.log('Processando imagens...');
                images = req.files.map((file, index) => {
                    console.log(`Imagem ${index + 1}:`, {
                        filename: file.filename,
                        originalname: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype
                    });
                    
                    return {
                        url: `${process.env.BASE}/media/${file.filename}`,
                        default: index === 0
                    };
                });
                console.log('Total de imagens processadas:', images.length);
            } else {
                console.log('Nenhuma imagem foi enviada');
            }

            
            const ad = new Ad({
                title,
                description: description || '',
                price,
                priceNegotiable,
                category: cats,
                idUser: user._id,
                state: state || '',
                dateCreated: new Date(),
                images
            });

            const savedAd = await ad.save();
            console.log('Anúncio salvo com ID:', savedAd._id);
            
            res.json({ 
                success: true, 
                ad: {
                    id: savedAd._id,
                    title: savedAd.title,
                    description: savedAd.description,
                    price: savedAd.price,
                    priceNegotiable: savedAd.priceNegotiable,
                    images: savedAd.images,
                    dateCreated: savedAd.dateCreated
                }
            });
        } catch (err) {
            console.error('Erro detalhado no addAction:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            res.status(500).json({ 
                error: 'Server error', 
                details: err.message 
            });
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
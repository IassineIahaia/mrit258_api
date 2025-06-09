const { validationResult, matchedData } = require('express-validator');
const State = require('../models/State');
const User = require('../models/User');
const Category = require('../models/Category');
const Ad = require('../models/Ads');

module.exports = {

    getStates: async (req, res) => {
        let states = await State.find();
        res.json({states});
    },

    info: async (req, res) => {
        try {
            let token = req.query.token || req.body.token || req.headers.authorization;
            
            if (!token) {
                return res.status(401).json({ error: 'Token não fornecido' });
            }

            // Buscar o usuário pelo token
            let user = await User.findOne({ token });
            
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Buscar informações do estado do usuário
            let state = null;
            if (user.state) {
                state = await State.findById(user.state);
            }

            // Buscar todos os anúncios do usuário com informações das categorias
            let ads = await Ad.find({ userId: user._id }).populate('category', 'name slug');

            // Buscar todas as categorias (caso precise)
            let categories = await Category.find();

            // Montar resposta completa
            const userInfo = {
                _id: user._id,
                name: user.name,
                email: user.email,
                state: state? state.name : null, 
                ads: ads.map(ad => ({
                    _id: ad._id,
                    title: ad.title,
                    description: ad.description,
                    price: ad.price,
                    category: ad.category,
                    images: ad.images,
                    status: ad.status,
                    views: ad.views,
                    dateCreated: ad.dateCreated
                })),
                totalAds: ads.length,
                categories: categories.map(cat => ({
                    _id: cat._id,
                    name: cat.name,
                    slug: cat.slug
                })),

                phone: user.phone,
                dateCreated: user.dateCreated,
                lastLogin: user.lastLogin
            };

            res.json(userInfo);

        } catch (error) {
            console.error('Erro ao buscar informações do usuário:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

editAction: async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }

        const data = matchedData(req);

        const user = await User.findOne({ token: data.token });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Campos que não devem ser atualizados diretamente
        const protectedFields = ['token', '_id', 'createdAt', 'updatedAt'];

        // Atualiza dinamicamente todos os campos válidos
        Object.keys(data).forEach(key => {
            if (!protectedFields.includes(key)) {
                user[key] = data[key];
            }
        });

        await user.save();

        return res.json({ success: true, updatedFields: data });
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

}
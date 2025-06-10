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
    try {
        let { 
            sort = 'desc', 
            offset = 0, 
            limit = 8, 
            q, 
            cat, 
            state, 
            priceFrom, 
            priceTo 
        } = req.query;

        console.log('=== DEBUG GETLIST ===');
        console.log('Query params:', { sort, offset, limit, q, cat, state, priceFrom, priceTo });

        // Conversões seguras
        offset = parseInt(offset) || 0;
        limit = parseInt(limit) || 8;
        limit = Math.min(limit, 50); // Máximo 50 por página

        // Construir filtros
        let filters = {};

        // Filtro por texto (título e descrição)
        if (q && q.trim()) {
            filters.$or = [
                { title: { $regex: q.trim(), $options: 'i' } },
                { description: { $regex: q.trim(), $options: 'i' } }
            ];
        }

        // Filtro por categoria
        if (cat && mongoose.Types.ObjectId.isValid(cat)) {
            filters.category = cat;
        }

        // Filtro por estado
        if (state && state.trim()) {
            filters.state = { $regex: state.trim(), $options: 'i' };
        }

        // Filtro por faixa de preço
        if (priceFrom || priceTo) {
            filters.price = {};
            if (priceFrom) {
                const minPrice = parseFloat(priceFrom);
                if (!isNaN(minPrice)) {
                    filters.price.$gte = minPrice;
                }
            }
            if (priceTo) {
                const maxPrice = parseFloat(priceTo);
                if (!isNaN(maxPrice)) {
                    filters.price.$lte = maxPrice;
                }
            }
        }

        console.log('Filtros aplicados:', JSON.stringify(filters, null, 2));

        // Definir ordenação
        let sortObj = {};
        switch (sort.toLowerCase()) {
            case 'asc':
                sortObj = { dateCreated: 1 };
                break;
            case 'desc':
            default:
                sortObj = { dateCreated: -1 };
                break;
            case 'price_asc':
                sortObj = { price: 1 };
                break;
            case 'price_desc':
                sortObj = { price: -1 };
                break;
        }

        // Buscar anúncios com populate da categoria e usuário
        const ads = await Ad.find(filters)
            .populate('category', 'name slug')
            .populate('idUser', 'name email state')
            .sort(sortObj)
            .skip(offset)
            .limit(limit)
            .exec();

        // Contar total de resultados para paginação
        const total = await Ad.countDocuments(filters);

        console.log(`Encontrados ${ads.length} anúncios de ${total} total`);

        // Formatar os dados de retorno
        const formattedAds = ads.map(ad => {
            // Pegar a imagem principal (primeira imagem ou padrão)
            let mainImage = null;
            if (ad.images && ad.images.length > 0) {
                const defaultImg = ad.images.find(img => img.default);
                mainImage = defaultImg ? defaultImg.url : ad.images[0].url;
            }

            return {
                id: ad._id,
                title: ad.title,
                description: ad.description,
                price: ad.price,
                priceNegotiable: ad.priceNegotiable,
                priceFormatted: ad.price > 0 ? 
                    `${ad.price.toLocaleString('pt', { minimumFractionDigits: 2 })} MZN` : 
                    'Gratuito',
                mainImage,
                category: ad.category ? {
                    id: ad.category._id,
                    name: ad.category.name,
                    slug: ad.category.slug
                } : null,
                user: ad.idUser ? {
                    id: ad.idUser._id,
                    name: ad.idUser.name,
                    state: ad.idUser.state
                } : null,
                state: ad.state,
                dateCreated: ad.dateCreated,
                dateFormatted: new Date(ad.dateCreated).toLocaleDateString('pt')
            };
        });

        // Calcular informações de paginação
        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        const hasNext = offset + limit < total;
        const hasPrev = offset > 0;

        res.json({
            success: true,
            ads: formattedAds,
            pagination: {
                total,
                totalPages,
                currentPage,
                limit,
                offset,
                hasNext,
                hasPrev,
                nextOffset: hasNext ? offset + limit : null,
                prevOffset: hasPrev ? Math.max(0, offset - limit) : null
            },
            filters: {
                sort,
                q: q || null,
                cat: cat || null,
                state: state || null,
                priceFrom: priceFrom || null,
                priceTo: priceTo || null
            }
        });

    } catch (err) {
        console.error('Erro detalhado no getList:', {
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

getItem: async (req, res) => {
    try {
        const { id } = req.params;
        let { related_limit = 4 } = req.query;

        console.log('=== DEBUG GETITEM ===');
        console.log('ID do anúncio:', id);

        // Validar se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                error: 'Invalid ad ID format' 
            });
        }

        // Buscar o anúncio específico com populate completo
        const ad = await Ad.findById(id)
            .populate('category', 'name slug')
            .populate('idUser', 'name email phone state')
            .exec();

        if (!ad) {
            return res.status(404).json({ 
                error: 'Ad not found' 
            });
        }

        console.log('Anúncio encontrado:', ad.title);

        // Buscar anúncios relacionados baseados na categoria
        related_limit = Math.min(parseInt(related_limit) || 4, 10); // Máximo 10 relacionados
        
        const relatedAds = await Ad.find({
            category: ad.category._id,
            _id: { $ne: ad._id }, // Excluir o próprio anúncio
        })
        .populate('category', 'name slug')
        .populate('idUser', 'name state')
        .sort({ dateCreated: -1 })
        .limit(related_limit)
        .exec();

        console.log(`Encontrados ${relatedAds.length} anúncios relacionados`);

        // Formatar o anúncio principal
        const formattedAd = {
            id: ad._id,
            title: ad.title,
            description: ad.description,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            priceFormatted: ad.price > 0 ? 
                `${ad.price.toLocaleString('pt', { minimumFractionDigits: 2 })} MZN` : 
                'Gratuito',
            category: ad.category ? {
                id: ad.category._id,
                name: ad.category.name,
                slug: ad.category.slug
            } : null,
            user: ad.idUser ? {
                id: ad.idUser._id,
                name: ad.idUser.name,
                email: ad.idUser.email,
                phone: ad.idUser.phone,
                state: ad.idUser.state
            } : null,
            state: ad.state,
            images: ad.images || [],
            dateCreated: ad.dateCreated,
            dateFormatted: new Date(ad.dateCreated).toLocaleDateString('pt'),
            views: ad.views || 0
        };

        // Formatar anúncios relacionados
        const formattedRelated = relatedAds.map(relatedAd => {
            // Pegar a imagem principal
            let mainImage = null;
            if (relatedAd.images && relatedAd.images.length > 0) {
                const defaultImg = relatedAd.images.find(img => img.default);
                mainImage = defaultImg ? defaultImg.url : relatedAd.images[0].url;
            }

            return {
                id: relatedAd._id,
                title: relatedAd.title,
                description: relatedAd.description.length > 100 ? 
                    relatedAd.description.substring(0, 100) + '...' : 
                    relatedAd.description,
                price: relatedAd.price,
                priceNegotiable: relatedAd.priceNegotiable,
                priceFormatted: relatedAd.price > 0 ? 
                    `${relatedAd.price.toLocaleString('pt', { minimumFractionDigits: 2 })} MZN` : 
                    'Gratuito',
                mainImage,
                category: relatedAd.category ? {
                    id: relatedAd.category._id,
                    name: relatedAd.category.name,
                    slug: relatedAd.category.slug
                } : null,
                user: relatedAd.idUser ? {
                    id: relatedAd.idUser._id,
                    name: relatedAd.idUser.name,
                    state: relatedAd.idUser.state
                } : null,
                state: relatedAd.state,
                dateCreated: relatedAd.dateCreated,
                dateFormatted: new Date(relatedAd.dateCreated).toLocaleDateString('pt')
            };
        });

        // Opcional: Incrementar contador de visualizações
        try {
            await Ad.findByIdAndUpdate(id, { 
                $inc: { views: 1 } 
            });
        } catch (viewError) {
            console.log('Erro ao incrementar visualizações:', viewError.message);
            // Não interromper a resposta por causa disso
        }

        res.json({
            success: true,
            ad: formattedAd,
            related: formattedRelated,
            meta: {
                relatedCount: formattedRelated.length,
                category: formattedAd.category?.name || 'Sem categoria'
            }
        });

    } catch (err) {
        console.error('Erro detalhado no getItem:', {
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

    editAction: async (req, res) => {
        // Implementar a lógica aqui
    }
};
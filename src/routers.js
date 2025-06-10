const express = require('express');
const router = express.Router();
const Auth = require('./middlewares/Auth');
const AuthValidator = require('./validators/AuthValidator');
const UserValidator = require('./validators/UserValidator');
const upload = require('./middlewares/upload');

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const AdsController = require('./controllers/AdsController');

// Teste de rota simples
router.get('/ping', (req, res) => {
    res.json({ pong: true });
});

// Estados (ex: províncias)
router.get('/states', UserController.getStates);

// Auth - Cadastro e Login
router.post('/user/signup', AuthValidator.signup, AuthController.signup);
router.post('/user/signin', AuthValidator.signin, AuthController.signin);

// Info e edição de usuário
router.get('/user/me', Auth.private, UserController.info);
router.put('/user/me', UserValidator.editAction, Auth.private, UserController.editAction);

// Categorias dos anúncios
router.get('/categories', AdsController.getCategories);

// Adição de anúncio com upload condicional
router.post(
    '/ad/add',
    (req, res, next) => {
        // Apenas aplica o upload se o content-type for multipart/form-data
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            upload.array('images', 10)(req, res, next);
        } else {
            next(); // pula o middleware de upload se não for multipart
        }
    },
    Auth.private,
    AdsController.addAction
);

// Listagem e detalhes de anúncios
router.get('/ad/list', AdsController.getList);

router.get('/ad/:id', AdsController.getItem);

// Edição de anúncio (com id dinâmico)
router.post('/ad/:id', AdsController.editAction);

// Middleware global para tratamento de erros
router.use((err, req, res, next) => {
    console.error('Erro global:', err);

    if (err.message && err.message.includes('Unexpected end of form')) {
        return res.status(400).json({
            error: 'Dados do formulário incompletos. Verifique se todos os campos foram preenchidos corretamente.'
        });
    }

    res.status(500).json({
        error: 'Erro interno do servidor',
        details: err.message
    });
});

module.exports = router;

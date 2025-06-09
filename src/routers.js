const express = require('express');
const router = express.Router();
const Auth = require('./middlewares/Auth');
const AuthValidator = require('./validators/AuthValidator');
const UserValidator = require('./validators/UserValidator');
const { upload, handleMulterError } = require('./middlewares/upload'); // ✅ Importação atualizada

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const AdsController = require('./controllers/AdsController');

router.get('/ping', (req, res) => {
    res.json({ pong: true });
});

router.get('/states', UserController.getStates);

router.post('/user/signup', AuthValidator.signup, AuthController.signup);
router.post('/user/signin', AuthValidator.signin, AuthController.signin);

router.get('/user/me', Auth.private, UserController.info);
router.put('/user/me', UserValidator.editAction, Auth.private, UserController.editAction);

router.get('/categories', AdsController.getCategories);

// ✅ Rota atualizada com tratamento de erro
router.post('/ad/add', 
    Auth.private, 
    upload.array('images', 5),  // mesmo nome do campo que o frontend envia
    handleMulterError,
    AdsController.addAction
);


router.get('/ad/list', AdsController.getList);
router.get('/ad/item', AdsController.getItem);
router.post('/ad/:id', AdsController.editAction);

// Middleware global para tratar erros não capturados
router.use((err, req, res, next) => {
    console.error('Erro global:', err);
    res.status(500).json({
        error: 'Erro interno do servidor'
    });
});

module.exports = router;
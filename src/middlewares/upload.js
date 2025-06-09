const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/media';
        try {
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        } catch (error) {
            console.error('Erro ao criar diretório:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        try {
            const uniqueName = Date.now() + '-' + Math.floor(Math.random() * 1E9) + path.extname(file.originalname);
            cb(null, uniqueName);
        } catch (error) {
            console.error('Erro ao gerar nome do arquivo:', error);
            cb(error);
        }
    }
});

// Filtro para validar tipos de arquivo
const fileFilter = (req, file, cb) => {
    // Permitir apenas imagens
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB por arquivo
        files: 5 // máximo 5 arquivos
    }
});

// Middleware para tratar erros do multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Arquivo muito grande. Tamanho máximo: 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Muitos arquivos. Máximo permitido: 5'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Campo de arquivo inesperado'
            });
        }
    }
    
    if (err.message === 'Apenas arquivos de imagem são permitidos!') {
        return res.status(400).json({
            error: err.message
        });
    }
    
    next(err);
};

module.exports = { upload, handleMulterError };
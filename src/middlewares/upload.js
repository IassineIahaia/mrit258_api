const multer = require('multer');
const path = require('path');

// Diretório onde as imagens serão salvas
const uploadDir = './public/media';

// Extensões permitidas
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas (jpg, jpeg, png, gif).'));
    }
};

// Limites do upload (ex: 5MB por imagem)
const limits = {
    fileSize: 5 * 1024 * 1024 // 5MB
};

const upload = multer({
    storage,
    fileFilter,
    limits
});

module.exports = upload;

const { validationResult, matchedData } = require('express-validator');

module.exports = {
    signin: async (req, res) => {
        res.json({ message: 'signin funcionando' });
    },
    
    signup: async (req, res) => {
        const errors = validationResult(req); // <- agora sim está correto

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.mapped() });
        }

        const data = matchedData(req); // Pega apenas os dados validados
        res.json({ sucesso: true, dados: data });
    }
};

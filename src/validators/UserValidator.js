

const { checkSchema } = require('express-validator');

module.exports = {
  editAction: checkSchema({
    token: {
        notEmpty: true,
        
    },
    name: {
      optional: true,
      notEmpty: true,
      trim: true,
      isLength: {
        options: { min: 3 }
      },
      errorMessage: 'O Nome é obrigatório e precisa ter mais de 3 caracteres'
    },
    email: {
        optional: true,
      isEmail: true,
      notEmpty: true,
      normalizeEmail: true,
      errorMessage: 'Email inválido'
    },
    password: {
        optional: true,
      notEmpty: true,
      isLength: {
        options: { min: 4 }
      },
      errorMessage: 'A senha é obrigatória e precisa ter no mínimo 4 caracteres'
    },
    state: {
      optional: true,
      notEmpty: {
        errorMessage: 'O Estado é obrigatório'
      },
      isMongoId: {
        errorMessage: 'ID do Estado inválido'
      }
    }
  }),

};

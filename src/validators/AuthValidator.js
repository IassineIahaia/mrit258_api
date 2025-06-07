
const { checkSchema } = require('express-validator');

module.exports = {
  signup: checkSchema({
    name: {
      isString: true,
      notEmpty: true,
      trim: true,
      isLength: {
        options: { min: 3 }
      },
      errorMessage: 'O Nome é obrigatório e precisa ter mais de 3 caracteres'
    },
    email: {
      isEmail: true,
      notEmpty: true,
      normalizeEmail: true,
      errorMessage: 'Email inválido'
    },
    password: {
      notEmpty: true,
      isLength: {
        options: { min: 4 }
      },
      errorMessage: 'A senha é obrigatória e precisa ter no mínimo 4 caracteres'
    },
    state: {
      notEmpty: {
        errorMessage: 'O Estado é obrigatório'
      },
      isMongoId: {
        errorMessage: 'ID do Estado inválido'
      }
    }
  })
};

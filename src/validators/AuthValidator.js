
const { checkSchema } = require('express-validator');

module.exports = {
  signup: checkSchema({
    name: {
      isString: true,
      notEmpty: true,
      trim: true,
      errorMessage: 'O Nome é obrigatorio e precisa ter mais de 3 caracteres',
      isLength: {
        options: { min: 3 }
      }
    },
    email: {
      isEmail: true,
      notEmpty: true,
      normalizeEmail: true,
      errorMessage: 'Email invalido'
    },
    password: {
      notEmpty: true,
      errorMessage: 'A senha é obrigatoria',
      isLength: {
        options: { min: 4 }
      }
    }
  })
}

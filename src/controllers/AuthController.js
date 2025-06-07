const { validationResult, matchedData } = require('express-validator');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const State = require('../models/State');

module.exports = {
signin: async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    }

    const data = matchedData(req);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos' });
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = user.token; // Pega o token já salvo no banco

    const { password, ...userData } = user._doc;

    return res.json({ user: userData, token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
,

  signup: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    }

    const data = matchedData(req);
    console.log(data); // Ajuda no debug

    // Verifica se o e-mail já existe
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    // Verifica se o estado existe
    const state = await State.findById(data.state);
    if (!state) {
      return res.status(400).json({ error: 'Estado não encontrado' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const payload = (Date.now() + Math.random()).toString();
    const token = await bcrypt.hash(payload, 10);

    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      state: data.state,
      token
    });
    await user.save();

    res.json({token});

  }
};

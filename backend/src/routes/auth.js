const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationCode } = require('../services/emailService');

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generateCode();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'paciente',
      emailVerified: false,
      emailVerificationCode: code,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendVerificationCode(user.email, user.name, code);

    return res.status(201).json({
      msg: 'Usuário cadastrado. Verifique seu email com o código enviado.'
    });
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao cadastrar usuário',
      error: error.message
    });
  }
});

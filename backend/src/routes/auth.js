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
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ msg: 'Usuário não encontrado' });
    }

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) {
      return res.status(400).json({ msg: 'Senha incorreta' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        msg: 'Verifique seu email antes de fazer login'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao fazer login',
      error: error.message
    });
  }
});
router.post('/verify-email-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    if (user.emailVerified) {
      return res.json({ msg: 'Email já verificado' });
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      return res.status(400).json({ msg: 'Nenhum código ativo encontrado' });
    }

    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ msg: 'Código expirado' });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ msg: 'Código inválido' });
    }

    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({ msg: 'Email verificado com sucesso' });
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao verificar código',
      error: error.message
    });
  }
});
router.post('/resend-verification-code', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ msg: 'Email já verificado' });
    }

    const code = generateCode();

    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationCode(user.email, user.name, code);

    return res.json({ msg: 'Código reenviado com sucesso' });
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao reenviar código',
      error: error.message
    });
  }
});

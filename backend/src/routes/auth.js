const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hash,
      role: role || 'paciente',
      emailVerified: false,
      emailVerificationToken: verificationToken
    });

    return res.json({
      msg: 'Usuário cadastrado com sucesso',
      verificationToken: verificationToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ msg: 'Erro ao cadastrar usuário', error: error.message });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token
    });

    if (!user) {
      return res.status(400).json({ msg: 'Token inválido' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    return res.json({ msg: 'Email verificado com sucesso' });
  } catch (error) {
    return res.status(500).json({ msg: 'Erro ao verificar email', error: error.message });
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
      return res.status(403).json({ msg: 'Verifique seu email antes de fazer login' });
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
    return res.status(500).json({ msg: 'Erro ao fazer login', error: error.message });
  }
});

module.exports = router;

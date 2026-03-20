module.exports = (req, res, next) => {
  if (req.user.role !== 'secretario') {
    return res.status(403).json({ msg: 'Acesso permitido apenas para secretários' });
  }

  next();
};

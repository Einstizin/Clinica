const router = require('express').Router();
const axios = require('axios');

router.get('/cep/:cep', async (req, res) => {
  try {
    const response = await axios.get(
      `https://viacep.com.br/ws/${req.params.cep}/json/`
    );
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao consultar CEP',
      error: error.message
    });
  }
});

router.get('/weather', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=Rio de Janeiro&appid=${process.env.WEATHER_KEY}`
    );
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao consultar clima',
      error: error.message
    });
  }
});

module.exports = router;

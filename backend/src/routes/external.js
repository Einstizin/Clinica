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

router.get('/weather/:date', async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=Rio de Janeiro&appid=${apiKey}&units=metric&lang=pt_br`
    );

    const targetDate = new Date(req.params.date);

    const forecast = response.data.list.find(item => {
      const itemDate = new Date(item.dt * 1000);

      return (
        itemDate.getDate() === targetDate.getDate() &&
        itemDate.getMonth() === targetDate.getMonth()
      );
    });

    if (!forecast) {
      return res.json({ msg: 'Previsão não encontrada' });
    }

    return res.json({
      weather: forecast.weather[0].description,
      rain: forecast.weather[0].main.toLowerCase().includes('rain'),
      temp: forecast.main.temp
    });

  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao consultar clima',
      error: error.message
    });
  }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const externalRoutes = require('./routes/external');

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('Erro MongoDB:', err.message));

app.get('/', (req, res) => {
  res.send('API da Clínica está funcionando 🚀');
});

app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/external', externalRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('rodando na porta', PORT));

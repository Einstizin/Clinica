const router = require('express').Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const appointmentDate = new Date(req.body.date);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ msg: 'Data inválida' });
    }

    const start = new Date(appointmentDate);
    const end = new Date(appointmentDate);

    // intervalo de 1 hora para considerar conflito
    end.setHours(end.getHours() + 1);

    const existing = await Appointment.findOne({
      date: {
        $gte: start,
        $lt: end
      }
    });

    if (existing) {
      return res.status(400).json({ msg: 'Horário ocupado' });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      date: appointmentDate,
      address: req.body.address
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao criar consulta', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const list = await Appointment.find().populate('patient');
    res.json(list);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao listar consultas', error: error.message });
  }
});

module.exports = router;

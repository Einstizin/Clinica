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
      patientName: req.body.patientName || req.user.name || 'Paciente',
      date: appointmentDate,
      address: req.body.address || ''
    });

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao criar consulta',
      error: error.message
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'secretario') {
      appointments = await Appointment.find()
        .populate('patient')
        .sort({ date: 1 });
    } else {
      appointments = await Appointment.find({
        patient: req.user.id
      })
        .populate('patient')
        .sort({ date: 1 });
    }

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao listar consultas',
      error: error.message
    });
  }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'secretario') {
      return res.status(403).json({
        msg: 'Apenas secretários podem cancelar consultas'
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    return res.json({ msg: 'Consulta cancelada com sucesso' });
  } catch (error) {
    return res.status(500).json({
      msg: 'Erro ao cancelar consulta',
      error: error.message
    });
  }
});

module.exports = router;

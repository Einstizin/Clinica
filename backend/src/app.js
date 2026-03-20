require('dotenv').config();
const express=require('express');const mongoose=require('mongoose');const cors=require('cors');
const auth=require('./routes/auth');const appt=require('./routes/appointments');const ext=require('./routes/external');
const app=express();app.use(cors());app.use(express.json());
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('DB ok'));
app.use('/auth',auth);app.use('/appointments',appt);app.use('/external',ext);
app.listen(3000,()=>console.log('rodando 3000'));

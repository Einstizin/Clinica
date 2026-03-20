const r=require('express').Router();const axios=require('axios');
r.get('/cep/:cep',async(req,res)=>{
const d=await axios.get(`https://viacep.com.br/ws/${req.params.cep}/json/`);
res.json(d.data);
});
r.get('/weather',async(req,res)=>{
const d=await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=Rio de Janeiro&appid=${process.env.WEATHER_KEY}`);
res.json(d.data);
});
module.exports=r;
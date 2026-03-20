const r=require('express').Router();
const A=require('../models/Appointment');const auth=require('../middleware/auth');
r.post('/',auth,async(req,res)=>{
const ex=await A.findOne({date:req.body.date});
if(ex)return res.status(400).json({msg:'ocupado'});
res.json(await A.create({patient:req.user.id,...req.body}));
});
r.get('/',auth,async(req,res)=>res.json(await A.find().populate('patient')));
module.exports=r;
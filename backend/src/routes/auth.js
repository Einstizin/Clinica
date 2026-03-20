const r=require('express').Router();
const b=require('bcrypt');const jwt=require('jsonwebtoken');const U=require('../models/User');
r.post('/register',async(req,res)=>{
const h=await b.hash(req.body.password,10);
res.json(await U.create({...req.body,password:h}));
});
r.post('/login',async(req,res)=>{
const u=await U.findOne({email:req.body.email});
if(!u)return res.sendStatus(400);
const ok=await b.compare(req.body.password,u.password);
if(!ok)return res.sendStatus(400);
res.json({token:jwt.sign({id:u._id},process.env.JWT_SECRET)});
});
module.exports=r;
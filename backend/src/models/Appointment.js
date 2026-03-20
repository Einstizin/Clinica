const m=require('mongoose');
module.exports=m.model('Appointment',new m.Schema({
patient:{type:m.Schema.Types.ObjectId,ref:'User'},date:Date,address:String
}));
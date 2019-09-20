const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;
const companySchema = new Schema({
  name:{
    type: String,
    required: true,
  },
  url:{
    type: String,
    required: true,
  },
  logo:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
  },
  password:{
    type: String,
    required: true,
  },
  summary:{
    type: String,
    required: true,
  },
  services:[
      {
        type:ObjectId,
        ref:'Service'
      }
  ],
  account:{
    type:ObjectId,
    ref:'Account'
  },
  paypal:{
    type:ObjectId,
    ref:'Paypal'
  },
  data_created:{
    type: Date,
    default: Date(),
  },
  data_fix:{
    type: Date,
    default: Date(),
  },
});

module.exports = mongoose.model('Company', companySchema);
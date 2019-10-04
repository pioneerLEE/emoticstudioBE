const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;
const paymentSchema = new Schema({
  service:{
    type:ObjectId,
    ref:'Service'
  },
  emojipacks:{
    type:ObjectId,
    ref:'Emojipack'
  },
  user:{
    type:ObjectId,
    ref:'User'
  },
  money:{
    type: Number,
    required: true,
  },
  useService:{
    type:Boolean,
    default:true
  },
  info:{
    type:String
  },
  data_created:{
    type: Date,
    default: Date(),
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
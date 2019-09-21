const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;
const authorSchema = new Schema({
  name:{
    type: String,
    required: true,
  },
  email:{
    type: String,
  },
  password:{
    type: String,
  },
  emojipacks:[
    {
        type:ObjectId,
        ref:'Emojipack'
    }
  ],
  //생년월일 ex)19980111
  birth:{
      type:Number,
      required: true,
  },
  email_verified :{ 
    type: Boolean, 
    required:true, 
    default: false 
  },
  key_for_verify :{
    type: String,
    required:true
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

module.exports = mongoose.model('Author', authorSchema);
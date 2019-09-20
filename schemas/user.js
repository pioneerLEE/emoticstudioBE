const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;
const userSchema = new Schema({
  nick:{
    type: String,
    required: true,
  },
  provider:{
    type: String,
  },
  sns_id:{
    type: String,
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
  services:[
    {
      type:ObjectId,
      ref:'Service'
    }
  ],
  // 성별 'male' 'female' 'x' 하...
  gender:{
    type:String
  },
  //생년월일
  birth:{
      type:Number,
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

module.exports = mongoose.model('User', userSchema);
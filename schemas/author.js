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
  // 작가의 성별은 필요없는 정보이므로 삭제
  /* 성별 'male' 'female' 'x'
  gender:{
    type:String,
    required: true,
  },*/
  //생년월일
  birth:{
      type:Number,
      required: true,
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
const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;
const email_directorySchema = new Schema({
  email:{
    type: String,
    required: true,
  },
  user:{
    type:ObjectId,
    ref:'User',
    required: true,
  },
  data_created:{
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Email_directory', email_directorySchema);
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;
const modificationreqSchema = new Schema({
  emojipack: {
    type: ObjectId,
    ref: 'Emojipack',
    required:true,
  },
  message:{
      type: String,
  },
  data_created:{
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Modificationreq', modificationreqSchema);
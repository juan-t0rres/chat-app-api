const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    author: String,
    body: String,
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', MessageSchema);

module.exports = { Message };

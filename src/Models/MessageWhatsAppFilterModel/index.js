const mongoose = require('mongoose')

const schema = mongoose.Schema({
  id: { type: String },
  idSender: { type: String },
  displayName: { type: String },
  formattedName: { type: String },
  body: { type: String },
  chatName: { type: String },
  chatId: { type: String },
  created_at: { type: String, default: new Date() },
  response: { type: String },
  responseSend: { type: String },
  isAnswered: { type: Boolean, default: false },
})

module.exports = mongoose.model('MessageWhatsAppFilterModel', schema)
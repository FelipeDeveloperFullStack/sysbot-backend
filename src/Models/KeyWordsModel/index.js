const mongoose = require('mongoose')

const schema = mongoose.Schema({
  word: {
    type: String,
    trim: true
  },
  create_at: {
    type: Date
  }
})

module.exports = mongoose.model('KeyWords', schema)
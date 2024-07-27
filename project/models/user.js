const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: String,
  date: {
    type: Date,
    default: Date.now
  }
})

// 在 Schema 中统一定义多个索引
UserSchema.index({ email: 1 }, { unique: true })
// UserSchema.index({ age: 1, name: -1 });

module.exports = mongoose.model('User', UserSchema)

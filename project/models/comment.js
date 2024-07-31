const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
  user: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    }
  },
  text: {
    type: String,
    required: true
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  likes: {
    type: Number,
    default: 0
},
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Comment', CommentSchema)

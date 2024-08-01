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
  isLeaf: {
    type: Boolean,
    default: true
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

// 使用 pre save 钩子在保存文档之前检查replies的长度并设置isLeaf的值
CommentSchema.pre('save', function (next) {
  this.isLeaf = !this.replies.length
  next()
})

module.exports = mongoose.model('Comment', CommentSchema)

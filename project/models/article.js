const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fields: [
    {
      filename: String,
      mimetype: String,
      originalname: String,
      path: String
    }
  ],
  author: {
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      }
    }
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  // comments: [
  //   {
  //     user: {
  //       id: {
  //         type: Schema.Types.ObjectId,
  //         ref: 'User'
  //       },
  //       name: {
  //         type: String
  //       },
  //       avatar: {
  //         type: String
  //       }
  //     },
  //     comment: {
  //       type: String,
  //       required: true
  //     },
  //     createdAt: {
  //       type: Date,
  //       default: Date.now
  //     }
  //   }
  // ],
  totalViews: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model('Article', ArticleSchema)

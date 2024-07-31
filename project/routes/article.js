const express = require('express')
const router = express.Router()
const { successResponse, errorResponse } = require('@/utils/responseHandler')
const authenticateToken = require('@/middleware/authenticateToken')

const Article = require('@/models/article')
const Comment = require('@/models/comment')
const User = require('@/models/user')

// @route   POST api/articles/add
// @desc    Create a new article
// @access  Private
router.post('/add', authenticateToken, (req, res) => {
  const { title, content, fields } = req.body

  User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return errorResponse(res, '用户未找到', 404)
      }

      const newArticle = new Article({
        title,
        content,
        fields,
        author: {
          id: req.user.id,
          name: req.user.name,
          avatar: req.user.avatar
        },
        otalViews: 0
      })

      newArticle
        .save()
        .then((article) => successResponse(res, article, '发布成功', 200))
        .catch((err) => errorResponse(res, '发布失败', 500))
    })
    .catch((err) => errorResponse(res, '未找到用户', 500))
})

// @route   GET api/articles
// @desc    Get all articles with pagination
// @access  Public
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  Article.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .then((articles) => {
      Article.countDocuments()
        .then((total) => {
          successResponse(
            res,
            {
              articles,
              total,
              page,
              pages: Math.ceil(total / limit)
            },
            '获取成功',
            200
          )
        })
        .catch((err) => errorResponse(res, '获取列表失败', 500))
    })
    .catch((err) => errorResponse(res, '检索帖子出错', 500))
})

// @route   GET api/articles/:id
// @desc    Get a single article by id
// @access  Public
router.get('/:id', (req, res) => {
  Article.findById(req.params.id)
    .then((article) => {
      if (!article) {
        return errorResponse(res, '帖子未找到', 404)
      }
      article.totalViews += 1

      article
        .save()
        .then((updatedArticle) => successResponse(res, updatedArticle, '文章成功获取', 200))
        .catch((err) => errorResponse(res, 'Error updating views', 500))

      // successResponse(res, article, 'Article retrieved successfully', 200)
    })
    .catch((err) => errorResponse(res, 'Error retrieving article', 500))
})

// @route   POST api/articles/:id/like
// @desc    Like an article
// @access  Private
router.post('/:id/like', authenticateToken, (req, res) => {
  Article.findById(req.params.id)
    .then((article) => {
      if (!article) {
        return errorResponse(res, '帖子未找到', 404)
      }

      User.findById(req.user.id)
        .then((user) => {
          if (!user) {
            return errorResponse(res, '用户未找到', 404)
          }

          if (article.likes.some((like) => like.id.toString() === req.user.id)) {
            return errorResponse(res, '已经点赞过了', 200)
          }

          article.likes.push({ id: req.user.id, name: req.user.name, avatar: req.user.avatar })
          article
            .save()
            .then(() => successResponse(res, article, '点赞成功', 200))
            .catch((err) => errorResponse(res, 'Error liking article', 500))
        })
        .catch((err) => errorResponse(res, 'Error finding user', 500))
    })
    .catch((err) => errorResponse(res, 'Error finding article', 500))
})

// @route   POST api/articles/:id/comments
// @desc    Comment on an article
// @access  Private
router.post('/:id/comments', authenticateToken, (req, res) => {
  const { text } = req.body

  if (!text) {
    return errorResponse(res, '评论内容不可为空', 400)
  }

  Article.findById(req.params.id)
    .then((article) => {
      if (!article) {
        return errorResponse(res, '帖子未找到', 404)
      }

      User.findById(req.user.id)
        .then((user) => {
          if (!user) {
            return errorResponse(res, '用户未找到', 404)
          }

          const newComment = new Comment({
            user: {
              id: req.user.id,
              name: req.user.name,
              avatar: req.user.avatar
            },
            text
          })

          // article.comments.push(newComment)

          newComment
            .save()
            .then((comment) => {
              article.comments.push(comment._id)
              article
                .save()
                .then(() => successResponse(res, comment, 'Comment added successfully', 200))
                .catch((err) => errorResponse(res, 'Error saving article with new comment', 500))
            })
            .catch((err) => errorResponse(res, 'Error saving comment', 500))

          // article
          //   .save()
          //   .then(() => successResponse(res, article, '评论成功', 200))
          //   .catch((err) => errorResponse(res, '评论失败', 500))
        })
        .catch((err) => errorResponse(res, '未找到评论用户', 500))
    })
    .catch((err) => errorResponse(res, '查找帖子出错', 500))
})

// 引用回复
// Add a reply to a comment
router.post('/:id/comments/:commentId/replies', authenticateToken, (req, res) => {
  const { text } = req.body

  if (!text) {
    return errorResponse(res, 'Please provide reply text', 400)
  }

  Comment.findById(req.params.commentId)
    .then((comment) => {
      if (!comment) return errorResponse(res, 'Comment not found', 404)

      const newReply = new Comment({
        user: {
          id: req.user.id,
          name: req.user.name,
          avatar: req.user.avatar
        },
        text
      })

      newReply
        .save()
        .then((reply) => {
          comment.replies.push(reply._id)
          comment
            .save()
            .then((updatedComment) => successResponse(res, reply, 'Reply added successfully', 200))
            .catch((err) => errorResponse(res, 'Error saving comment with new reply', 500))
        })
        .catch((err) => errorResponse(res, 'Error saving reply', 500))
    })
    .catch((err) => errorResponse(res, 'Error fetching comment', 500))
})

// 点赞评论
// Like a comment
router.post('/comments/:commentId/like', authenticateToken, (req, res) => {
  Comment.findById(req.params.commentId)
    .then((comment) => {
      if (!comment) return errorResponse(res, 'Comment not found', 404)

      comment.likes += 1

      comment
        .save()
        .then((updatedComment) =>
          successResponse(res, updatedComment, 'Comment liked successfully', 200)
        )
        .catch((err) => errorResponse(res, 'Error liking comment', 500))
    })
    .catch((err) => errorResponse(res, 'Error fetching comment', 500))
})

// 获取外层评论和懒加载
// Get comments for an article with pagination
router.get('/:id/comments', authenticateToken, (req, res) => {
  const { page = 1, limit = 10 } = req.query

  Article.findById(req.params.id)
    .populate({
      path: 'comments',
      options: {
        skip: (page - 1) * limit,
        limit: parseInt(limit)
      },
      populate: {
        path: 'replies',
        model: 'Comment'
      }
    })
    .then((article) => {
      if (!article) return errorResponse(res, 'Article not found', 404)

      const comments = article.comments
      successResponse(res, comments, 'Comments fetched successfully', 200)
    })
    .catch((err) => errorResponse(res, 'Error fetching article', 500))
})

// Helper function to recursively populate comments with pagination
const populateCommentsWithPagination = (commentId, page, limit) => {
  return Comment.findById(commentId)
    .populate({
      path: 'replies',
      options: {
        skip: (page - 1) * limit,
        limit: parseInt(limit)
      },
      populate: {
        path: 'replies',
        model: 'Comment'
      }
    })
    .exec()
}

// 内层懒加载
// Get replies for a comment with pagination
router.get('/comments/:commentId/replies', authenticateToken, (req, res) => {
  const { page = 1, limit = 10 } = req.query

  populateCommentsWithPagination(req.params.commentId, page, limit)
    .then((comment) => {
      if (!comment) return errorResponse(res, 'Comment not found', 404)

      const replies = comment.replies
      successResponse(res, replies, 'Replies fetched successfully', 200)
    })
    .catch((err) => errorResponse(res, 'Error fetching replies', 500))
})

module.exports = router

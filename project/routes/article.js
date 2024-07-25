const express = require('express')
const router = express.Router()
const { successResponse, errorResponse } = require('@/utils/responseHandler')
const authenticateToken = require('@/middleware/authenticateToken')

const Article = require('@/models/article')
const User = require('@/models/user')

// @route   POST api/articles
// @desc    Create a new article
// @access  Private
router.post('/add', authenticateToken, (req, res) => {
  const { title, content } = req.body

  User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return errorResponse(res, 'User not found', 404)
      }

      const newArticle = new Article({
        title,
        content,
        author: {
          id: req.user.id,
          name: user.name
        }
      })

      newArticle
        .save()
        .then((article) => successResponse(res, article, 'Article created successfully', 200))
        .catch((err) => errorResponse(res, 'Error creating article', 500))
    })
    .catch((err) => errorResponse(res, 'Error finding user', 500))
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
            'Articles retrieved successfully',
            200
          )
        })
        .catch((err) => errorResponse(res, 'Error counting articles', 500))
    })
    .catch((err) => errorResponse(res, 'Error retrieving articles', 500))
})

// @route   GET api/articles/:id
// @desc    Get a single article by id
// @access  Public
router.get('/:id', (req, res) => {
  Article.findById(req.params.id)
    .then((article) => {
      if (!article) {
        return errorResponse(res, 'Article not found', 404)
      }
      successResponse(res, article, 'Article retrieved successfully', 200)
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
        return errorResponse(res, 'Article not found', 404)
      }

      User.findById(req.user.id)
        .then((user) => {
          if (!user) {
            return errorResponse(res, 'User not found', 404)
          }

          if (article.likes.some((like) => like.id.toString() === req.user.id)) {
            return errorResponse(res, '已经点赞过了', 200)
          }

          article.likes.push({ id: req.user.id, name: user.name })
          article
            .save()
            .then(() => successResponse(res, article, '点赞成功', 200))
            .catch((err) => errorResponse(res, 'Error liking article', 500))
        })
        .catch((err) => errorResponse(res, 'Error finding user', 500))
    })
    .catch((err) => errorResponse(res, 'Error finding article', 500))
})

// @route   POST api/articles/:id/comment
// @desc    Comment on an article
// @access  Private
router.post('/:id/comment', authenticateToken, (req, res) => {
  const { comment } = req.body

  Article.findById(req.params.id)
    .then((article) => {
      if (!article) {
        return errorResponse(res, 'Article not found', 404)
      }

      User.findById(req.user.id)
        .then((user) => {
          if (!user) {
            return errorResponse(res, 'User not found', 404)
          }
          article.comments.push({
            user: {
              id: req.user.id,
              name: user.name
            },
            comment
          })

          article
            .save()
            .then(() => successResponse(res, article, 'Comment added successfully', 200))
            .catch((err) => errorResponse(res, 'Error adding comment', 500))
        })
        .catch((err) => errorResponse(res, 'Error finding user', 500))
    })
    .catch((err) => errorResponse(res, 'Error finding article', 500))
})

module.exports = router

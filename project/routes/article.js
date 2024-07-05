const express = require('express')
const router = express.Router()
const { successResponse, errorResponse } = require('../utils/responseHandler')
const authenticateToken = require('../middleware/authenticateToken')

// Load Article model
const Article = require('../models/article')
const User = require('../models/user')

// @route   POST api/articles/add
// @desc    Create a new article  发布文章帖子
// @access  Private
router.post('/add', authenticateToken, (req, res) => {
  const { title, content } = req.body
console.log(req.user);
  // Create new article
  const newArticle = new Article({
    title,
    content,
    author: req.user.id
  })

  newArticle
    .save()
    .then((article) => successResponse(res, article, 'Article created successfully', 201))
    .catch((err) => errorResponse(res, 'Error creating article', 500))
})

// @route   GET api/articles
// @desc    Get all articles
// @access  Public
router.get('/', (req, res) => {
  Article.find()
    .populate('author', 'name') // Populate author field with user name
    .sort({ createdAt: -1 })
    .then((articles) => successResponse(res, articles, 'Articles retrieved successfully', 200))
    .catch((err) => errorResponse(res, 'Error retrieving articles', 500))
})

// @route   GET api/articles/:id
// @desc    Get a single article by id
// @access  Public
router.get('/:id', (req, res) => {
  Article.findById(req.params.id)
    .populate('author', 'name')
    .populate('comments.user', 'name') // Populate user name in comments
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

      // Check if the user has already liked the article
      if (article.likes.includes(req.user.id)) {
        return errorResponse(res, 'Article already liked', 400)
      }

      // Add user to likes
      article.likes.push(req.user.id)
      article
        .save()
        .then(() => successResponse(res, article, 'Article liked successfully', 200))
        .catch((err) => errorResponse(res, 'Error liking article', 500))
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

      // Add comment to the article
      article.comments.push({
        user: req.user.id,
        comment
      })

      article
        .save()
        .then(() => successResponse(res, article, 'Comment added successfully', 200))
        .catch((err) => errorResponse(res, 'Error adding comment', 500))
    })
    .catch((err) => errorResponse(res, 'Error finding article', 500))
})

module.exports = router

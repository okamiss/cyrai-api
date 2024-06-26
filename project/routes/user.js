const express = require('express')
const router = express.Router()

// Load User model
const User = require('../models/user')

const { successResponse, errorResponse } = require('../utils/responseHandler')

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users route works' }))

// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/', (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(404).json({ nousersfound: 'No users found' }))
})

// @route   POST api/users
// @desc    Create user
// @access  Public
// 用户注册
router.post('/', (req, res) => {
  console.log(req.body, '@@@@@@@@@@@@@@@@@@')
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  })

  newUser
    .save()
    .then((user) => successResponse(res, user, '注册成功', 200))
    .catch((err) => errorResponse(res, err.message, 500))
})

// @route   GET api/users/:id
// @desc    Get single user by id
// @access  Public
router.get('/:id', (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => res.status(404).json({ nouserfound: 'No user found with that ID' }))
})

// @route   DELETE api/users/:id
// @desc    Delete user by id
// @access  Public
router.delete('/:id', (req, res) => {
  User.findById(req.params.id)
    .then((user) => user.remove().then(() => res.json({ success: true })))
    .catch((err) => res.status(404).json({ error: 'No such user' }))
})

module.exports = router

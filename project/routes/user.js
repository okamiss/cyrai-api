const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { successResponse, errorResponse } = require('@/utils/responseHandler')

const authenticateToken = require('@/middleware/authenticateToken')

// Load User model
const User = require('@/models/user')

// 在模型初始化时创建索引
User.on('index', (error) => {
  if (error) {
    console.error('User索引创建错误: ', error)
  } else {
    console.log('所有User索引创建成功')
  }
})

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
// router.get('/test', (req, res) => res.json({ msg: 'Users route works' }))

// @route   GET api/users
// @desc    Get all users
// @access  Public
// router.get('/', (req, res) => {
//   User.find()
//     .then((users) => res.json(users))
//     .catch((err) => res.status(404).json({ nousersfound: 'No users found' }))
// })

// @route   POST api/users
// @desc    用户注册
// @access  Public
// router.post('/', (req, res) => {
//   const newUser = new User({
//       name: req.body.name,
//       email: req.body.email
//   });

//   newUser.save()
//       .then(user => res.json(user))
//       .catch(err => res.status(400).json({ error: 'Unable to add this user' }));
// });

// @route   GET api/users/:id
// @desc    Get single user by id
// @access  Public
// router.get('/:id', (req, res) => {
//   User.findById(req.params.id)
//     .then((user) => res.json(user))
//     .catch((err) => res.status(404).json({ nouserfound: 'No user found with that ID' }))
// })

// @route   DELETE api/users/:id
// @desc    Delete user by id
// @access  Public
// router.delete('/:id', (req, res) => {
//   User.findById(req.params.id)
//     .then((user) => user.remove().then(() => res.json({ success: true })))
//     .catch((err) => res.status(404).json({ error: 'No such user' }))
// })

// ------------------------------------------------------------------------------------------------------------------------------------------
// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
  const { name, email, password } = req.body

  // Check if user exists
  User.findOne({ email })
    .then((user) => {
      if (user) {
        return errorResponse(res, '邮箱已被注册', 400)
      } else {
        const newUser = new User({
          name,
          email,
          password
        })

        // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          if (err) return errorResponse(res, 'Error generating salt', 500)

          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) return errorResponse(res, 'Error hashing password', 500)

            newUser.password = hash
            newUser
              .save()
              .then((user) => successResponse(res, user, '注册成功', 200))
              .catch((err) => {
                if (err.code === 11000) {
                  errorResponse(res, err.message, 201)
                } else {
                  errorResponse(res, err.message, 500)
                }
              })
          })
        })
      }
    })
    .catch((err) => errorResponse(res, 'Error finding user', 500))
})

// @route   POST api/users/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', (req, res) => {
  const { email, password } = req.body

  // Find user by email
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return errorResponse(res, 'User not found', 404)
      }

      // Check password
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            // User matched
            const payload = { id: user.id, name: user.name }

            // Sign token
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
              if (err) return errorResponse(res, 'Error signing token', 500)
              successResponse(
                res,
                {
                  name: user.name,
                  email: user.email,
                  token: token
                },
                '登录成功',
                200
              )
            })
          } else {
            return errorResponse(res, 'Password incorrect', 400)
          }
        })
        .catch((err) => errorResponse(res, 'Error comparing password', 500))
    })
    .catch((err) => errorResponse(res, 'Error finding user', 500))
})

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', authenticateToken, (req, res) => {
  successResponse(
    res,
    {
      id: req.user.id,
      name: req.user.name,
    },
    'User data retrieved successfully',
    200
  )
})

module.exports = router

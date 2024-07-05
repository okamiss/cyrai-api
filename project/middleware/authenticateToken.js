const jwt = require('jsonwebtoken')
const { errorResponse } = require('../utils/responseHandler')

function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization')
  const token = authHeader
  if (!token) return errorResponse(res, 'token为空', 401)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return errorResponse(res, 'Token 无效', 401)
  }
}

module.exports = authenticateToken

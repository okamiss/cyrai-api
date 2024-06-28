const jwt = require('jsonwebtoken')
const { errorResponse } = require('../utils/responseHandler')

function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization')
  console.log(authHeader, '@@@@@@@')
  const token = authHeader
  if (!token) return errorResponse(res, 'No token, authorization denied', 401)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return errorResponse(res, 'Token is not valid', 401)
  }
}

module.exports = authenticateToken

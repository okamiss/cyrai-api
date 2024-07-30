const jwt = require('jsonwebtoken')
const { errorResponse } = require('@/utils/responseHandler')

function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization')
  const token = authHeader
  if (!token) return errorResponse(res, '请先登录', 201)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return errorResponse(res, '身份验证已失效，请重新登录', 201)
  }
}

module.exports = authenticateToken

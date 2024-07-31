const express = require('express')
const router = express.Router()
const upload = require('@/middleware/upload')
const { successResponse, errorResponse } = require('@/utils/responseHandler')
const authenticateToken = require('@/middleware/authenticateToken')

const Attachment = require('@/models/attachment')

// @route   POST api/upload
// @desc    Upload an attachment
// @access  Private
router.post('/', authenticateToken, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return errorResponse(res, err, 400)
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No files uploaded', 400)
    }

    const fileInfos = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      path: `${process.env.SERVICE_IP}/${file.path.replace(/\\/g, '/')}`,
      mimetype: file.mimetype,
      size: file.size
    }))

    Attachment.insertMany(fileInfos)
      .then((attachments) => successResponse(res, attachments, '上传成功', 200))
      .catch((err) => errorResponse(res, 'Error saving attachments', 500))
  })
})

module.exports = router

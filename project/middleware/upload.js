const multer = require('multer')
const fs = require('fs')
const path = require('path')

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 获取当前日期
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0') // 获取月份，并补0

    // 生成文件夹名称
    const folderName = `${year}${month}`
    const uploadFolderPath = path.join(path.resolve(), 'uploads')
    const folderPath = path.join(uploadFolderPath, folderName)

    // 检查文件夹是否存在
    if (!fs.existsSync(folderPath)) {
      // 创建文件夹
      fs.mkdirSync(folderPath)
      // console.log(`文件夹 ${folderName} 创建成功`)
    }

    cb(null, `uploads/${folderName}`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).any() // Accept any file with any field name

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('Error: Files of type ' + filetypes + ' only!')
  }
}

module.exports = upload

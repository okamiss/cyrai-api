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
    const day = ('0' + now.getDate()).slice(-2)

    // 构建目录路径
    const directoryPath = path.join(path.resolve(), 'uploads', year.toString(), month, day)
    const setPath = path.join('uploads', year.toString(), month, day)

    // 检查目录是否存在，如果不存在则创建
    fs.mkdir(directoryPath, { recursive: true }, (err) => {
      if (err) {
        return console.error(`Failed to create directory: ${err.message}`)
      }
      // console.log(`Directory created successfully: ${directoryPath}`)
      cb(null, setPath)
    })
    // cb(null, `uploads/${folderName}`)
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

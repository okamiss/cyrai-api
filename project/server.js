const express = require('express')
const cors = require('cors')

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')

const app = express()

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })

// console.log('Running in', process.env.NODE_ENV, 'mode')
// console.log('MONGO_URI:', process.env.MONGO_URI)
// console.log('PORT:', process.env.PORT)

// Body parser middleware
app.use(bodyParser.json())
app.use(cors())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('连接数据库成功'))
  .catch((err) => console.log(err))

// 注册路由  user
const userRoutes = require('./routes/user')
const articleRoutes = require('./routes/article')

app.use('/api/users', userRoutes)
app.use('/api/articles', articleRoutes)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`启动端口：http://localhost:${port}`))

/*
    定义一个模块 连接MongoDB数据库
*/
// tools/connect.cjs
const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1/MyManager", { 
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.once('open', () => {
  console.log('数据库连接成功',mongoose.connection.name)
})

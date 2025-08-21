require('./tools/connect.cjs')
const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const jwt = require('jsonwebtoken')
const app = express()
const dataRouter = require('./router/getData.cjs')
const usersRouter = require('./router/userList.cjs')
const deptList = require('./router/deptList.cjs')
const menuList = require('./router/menuList.cjs')
const roleList = require('./router/roleList.cjs')
const orderList = require('./router/orderList.cjs')
const usersModel = require('./models/usersList.cjs')
const secret = 'hello' 
async function  getUser() {
        const data = await fs.readFile(path.resolve(__dirname,'data/usersList.json'))
        //console.log(JSON.parse(data))
        return JSON.parse(data)
}
//暴露图片资源文件夹
app.use('/images', express.static(path.join(__dirname, 'public/images')))
app.use((req, res, next) => {
   if (req.url === '/user/login' || req.url.startsWith('/images')) {
    return next()
  }
  if (req.url !== '/user/login') {
    const token = req.headers['authorization']
    try {
      const decoded = jwt.verify(token, secret)
      req.user = decoded
      console.log(decoded)
      next()
    } catch (e) {
      return res.status(201).send({
        code: 500001,
        data: {},
        msg: 'token 失效或未登录'
      })
    }
  } else {
    next()
  }
})
 //解析body
app.use(express.urlencoded({ extended: true }))
// 支持 application/json
app.use(express.json()) 

//引入图形数据接口
app.use('/order',dataRouter)
//引入用户接口
app.use('/users',usersRouter)
//引入列表接口
app.use('/dept',deptList)
//引入菜单接口
app.use('/menu',menuList)
//引入角色接口
app.use('/roles',roleList)
//引入命令接口
app.use('/order',orderList)
app.post('/user/login', async (req, res) => {
  const { userName, userPwd } = req.body
  //console.log(userName)
  const user = await usersModel.findOne({userName:userName})
  //console.log(user)
//  console.log(user)
  if (user&&userPwd==='111111') {
   const token = jwt.sign({
  id: user._id,
  userName: user.userName,
  roleList: user.roleList
}, secret, { expiresIn: '10d' })
    res.send({
      code: 0,
      data: { token },
      msg: '登录成功'
    })
  } else {
    res.send({
      code: 1,
      data: {},
      msg: '账号密码错误'
    })
  }
})
app.listen('3000',()=>{
    console.log('服务器启动了')
   // usersModel.find().then(item=>{console.log(item)})
})
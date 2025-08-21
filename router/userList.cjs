const express = require('express')
const usersModel = require('../models/usersList.cjs')
const userPermission = require('../models/userPermissionList.cjs')
const path = require('path')
const multer = require('multer')
const router = express.Router()
//去掉button 
function cleanMenuButtons(menuList) {
  if (!Array.isArray(menuList)) return
  menuList.forEach(item => {
    if (Array.isArray(item.children)) {
      if (item.children.length === 0) {
        // children 为空数组，删掉 children，保留 button
        delete item.children
      } else {
        // children 非空，保留 children，删掉 button
        delete item.button
        // 递归继续处理子菜单
        cleanMenuButtons(item.children)
      }
    }
  })
}
/* ------------------ 图片上传相关配置 ------------------ */

// 配置 multer 存储位置和文件名
const storage = multer.diskStorage({
  // 设置文件保存的目录
  destination: (req, file, cb) => {
    // 将图片存储到 /public/images 目录
    // path.join 确保路径兼容不同系统
    cb(null, path.join(__dirname, '../public/images'))
  },
  // 设置文件的命名规则
  filename: (req, file, cb) => {
    // 取出文件原始的后缀名，比如 .jpg / .png
    const ext = path.extname(file.originalname)
    // 使用当前时间戳作为文件名，避免重名覆盖
    cb(null, Date.now() + ext)
  }
})

// 使用 multer 并绑定存储配置
const upload = multer({ storage })
router.use((req,res,next)=>{
  if(req.user){
    
    next()
  }else{
    res.send({
        code: 50001,
        data: {},
        msg: 'token过期了'
    })
  }
})
// 上传接口
// upload.single('file') 表示只接收一个文件，字段名是 'file'
router.post('/upload', upload.single('file'), (req, res) => {
  // 生成前端可访问的图片路径（这里是相对路径）
  const fileUrl = `http://localhost:3000/images/${req.file.filename}`
  
  // 返回上传成功的响应
  res.send({
    code: 0,
    msg: '上传成功',
    url: fileUrl // 前端可以用这个 URL 来显示图片
  })
})
/* ------------------------------------------------------- */


router.get('/getUserInfo', async (req, res) => {
  try {
    const roleList = req.user.roleList // 当前登录用户的 roleList
    console.log(roleList)
    const user = await usersModel.findOne({roleList})
    
    if (!user) {
      return res.send({
        code: 1,
        msg: '未找到该用户',
        data: {}
      })
    }

    res.send({
      code: 0,
      msg: '',
      data: user // 直接返回对象，不带 "0" 这种键
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({
      code: 500,
      msg: '服务器错误',
      data: {}
    })
  }
})

// 获取用户列表接口
router.get('/list', async (req, res) => {
    const data = await usersModel.find()
    let list = data
    // 获取 query 参数
  const { state, userId, userName } = req.query
  //console.log(state,userId,userName)
  // 按状态筛选（0 表示全部，不筛选）
  if (state && state !== '0') {
    list = list.filter(item =>String(item.state) === String(state))
  }

  // 按用户ID筛选
  if (userId) {
    list = list.filter(item => String(item.userId).includes(String(userId)))
  }

  // 按用户名称模糊搜索
  if (userName) {
    list = list.filter(item =>
      item.userName && item.userName.includes(userName)
    )
  }
  //console.log(list)
   res.send({
    code: 0,
    data: {
      list:list,
      page: {
        pageSize:1,
        pageNumber:10,
        total:list.length
      }
    },
    msg: 'success'
  })
})
//创建用户接口
router.post('/create',async(req,res)=>{
   // console.log(req.body)
    const newUser={userId:Date.now(),...req.body}
    const newData= await usersModel.insertOne(newUser)
    res.send({
      code:0,
      msg:'创建成功',
      data:newData
    })
})
//编辑用户接口
router.post('/edit', async (req, res) => {
  try {
    const { userId, ...updates } = req.body
    const updatedUser = await usersModel.findOneAndUpdate(
      { userId: Number(userId) },
      { $set: updates },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).send({
        code: 1,
        msg: '用户不存在',
        data: {}
      })
    }

    res.send({
      code: 0,
      msg: '编辑成功',
      data: updatedUser
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      code: 500,
      msg: '服务器错误',
      data: {}
    })
  }
})


//删除用户
router.post('/delete', async (req, res) => {
  console.log(req.body)
  let { userId } = req.body

    console.log(userId)
 await usersModel.deleteMany({ userId: { $in: userId } }).then(item=>{
    console.log('删除成功')
  })
  res.send({
    code: 0,
    data: {},
    msg: '删除成功'
  })
})

//获取所有用户列表
router.get('/all/list',async(req,res)=>{
  const data = await usersModel.find({})
  res.send({
    code:0,
    msg:'success',
    data:data
  })
})
//获取用户权限信息
router.get('/getPermissionList',async(req,res)=>{
  const data = await userPermission.findOne({_id:'68a534ea5413ed173c14a251'})
  if(data.menuList){
    cleanMenuButtons(data.menuList)
  }
  res.send({
    meg:'',
    code:0,
    data:data
  })
})
module.exports = router

const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const multer = require('multer')
const router = express.Router()
const roleList =require('../models/rolelists.cjs')
router.use((req,res,next)=>{
    if(req.user){
        next()
    }else{
        res.status(201).send({
            code:500001,
            data:{

            },
            msg:'token失效了'
        })
    }
    
})
// 读取角色列表信息
async function getRolesList() {
    const data = await fs.readFile(path.resolve(__dirname,'../data/roleList.json'))
    return JSON.parse(data)
}

//将新数组重新写入文件中并且将新数据读取出来
async function updateRoleList(newData) {
  await fs.writeFile(
    path.resolve(__dirname, '../data/roleList.json'),
    JSON.stringify(newData, null, 2)
  )
  console.log('写入成功')
  return newData
}
router.get('/list', async (req, res) => {
    const { roleName } = req.query
    let query = {}
    if (roleName) query.roleName = roleName
    let data = await roleList.find(query)
    res.send({
        code: 0,
        msg: '',
        
        data:{
          list:data
        }
        
    })
})
router.get('/alllist', async (req, res) => {
   
    let data = await roleList.find({})

    res.send({
        code: 0,
        msg: '',
        data:data
    })
})
router.post('/create', async (req, res) => {
    const newRole = {
        _id: new Date().toISOString(),
        permissionList: {
            checkedKeys: [],
            halfCheckedKeys: []
        },
        updateTime: new Date().toLocaleString(),
        createTime: new Date().toLocaleString(),
        remark: '',
        ...req.body
    }
    const resData = await roleList.create(newRole)
    res.send({
        code: 0,
        msg: '',
        data: resData
    })
})
router.post('/edit', async (req, res) => {
  const { _id,...item } = req.body  // 从请求体拿到_id和其它要更新的字段
const data = await roleList.findOneAndUpdate({_id},{$set:{...item}},{ new: true })

  res.send({
    code: 0,
    msg: '编辑成功',
    data
  })
})
router.post('/delete', async (req, res) => {
  const { _id } = req.body
  await roleList.deleteOne({_id})
  res.send({
    code: 0,
    msg: '删除成功',
    data: {}
  })
})
//设置用户权限信息
router.post('/updata/permission',async(req,res)=>{
  console.log('用户权限被访问了')
   const {_id,permissionList} = req.body
  await roleList.findOneAndUpdate({_id},{$set:{permissionList:permissionList}})
   res.send({
    code:0,
    msg:'成功',
    data:{}
   })
})
module.exports = router

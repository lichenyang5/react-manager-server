const express = require('express')
const router = express.Router()
const ExcelJS = require('exceljs');
const orderList = require('../models/orderList.cjs')
const cityList = require('../models/cityList.cjs')
const vehicleList = require('../models/vehiclelists.cjs')
const cityData = require('../models/citydatas.cjs')
const driverList =require('../models/driverlists.cjs')
router.use((req,res,next)=>{
    if(req.path === '/export'){
      return  next()
    }
    if(req.user){
        next()
    }
    else{
        res.send({
            code:500001,
            msg:'token失效'
        })
    }
})
// 获取订单列表
// 获取订单列表
router.get('/list', async (req, res) => {
  try {
    const { orderId, userName, state } = req.query
    // 拼接查询条件
    const query = {}
    if (orderId) query.orderId = orderId
    if (userName) query.userName = userName
    if (state) query.state = +state
    console.log(query)
    // 查 MongoDB
    const list = await orderList.find(query)
    console.log()
    console.log('这是进行中的订单信息',list)
    res.send({
      code: 0,
      data: {
        list: list,
        page: {
          pageNum: 1,
          pageSize: 10,
          total: list.length
        }
      },
      msg: 'success'
    })
  } catch (error) {
    res.status(500).send({ code: 1, msg: '获取订单列表失败' })
  }
})
// 获取订单详情
router.get('/detail/:orderId', async (req, res) => {
  try {
    const {orderId} = req.params
    const order = await orderList.findOne({orderId})
    if (order) {
      res.send({
        code: 0,
        msg: '',
        data: order
      })
    } else {
      res.send({
        code: 1,
        msg: '订单不存在',
        data: {}
      })
    }
  } catch (error) {
    res.status(500).send({
      code: 1,
      msg: '获取订单详情失败'
    })
  }
})
// 获取城市列表
router.get('/citylist', async (req, res) => {
  try {
    const data = await cityList.find({})
    res.send({ code: 0, data: data,msg:'' })
  } catch (error) {
    res.status(500).json({ code: 1, message: '获取城市列表失败' })
  }
})

// 获取车型列表
router.get('/vehiclelist', async (req, res) => {
  try {
    const data = await vehicleList.find({})
    res.send({ code: 0, data: data })
  } catch (error) {
    res.status(500).json({ code: 1, message: '获取车型列表失败' })
  }
})
// 创建订单
router.post('/create', async (req, res) => {
  try {
    // 新订单数据
    const newOrder = {
      _id: Date.now().toString(), // 唯一ID
     orderId:`T${ Date.now().toString()}`, // 唯一OrderID
      ...req.body,              // 前端传来的数据
      createTime: new Date().toISOString() // 创建时间
    }

    orderList.create(newOrder)
    //首先是数据，然后是格式比如数组或者对象转化 2用来控制缩进和美化输出。
    res.send({
      code: 0,
      msg: '创建订单成功',
      data: newOrder
    })
  } catch (error) {
    res.status(500).send({ code: 1, msg: '创建订单失败' })
  }
})
// 更新订单信息
router.post('/edit', async (req, res) => {
  const { orderId, route: newRouter } = req.body
  if (!orderId || !Array.isArray(newRouter)) {
    return res.status(400).json({ msg: '参数不合法' })
  }
  const list = await orderList.findOneAndUpdate({orderId},{
    $set:{route:newRouter}
  })
  res.json({
    code: 0,
    msg: '更新成功',
    data: list
  })
})
// 删除订单
router.post('/delete', async (req, res) => {
  const { id } = req.body
  await orderList.deleteOne({orderId:id})
  res.json({ msg: '删除成功',code:0,data:{} })
})
function format(state){
    console.log('aaaa')
    const arr={
        1:'进行中',
        2:'完成',
        3:'超时',
        4:'取消'
    }
    return arr[state]
}
//导出
router.post('/export', async (req, res) => {
  try {
    const params = req.body;
    console.log('导出参数', params);
    let orders = await orderList.find({});

  const newData=  orders.map(item=>{
        item={
            ...item,
            state: format(item.state)
        }
        return item
    })
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('订单列表');
    worksheet.columns = [
      { header: '订单ID', key: 'orderId', width: 20 },
      { header: '城市', key: 'cityName', width: 15 },
      { header: '车型', key: 'vehicleName', width: 15 },
      { header: '下单时间', key: 'createTime', width: 20 },
      { header: '订单状态', key: 'state', width: 15 },
    ];
    worksheet.addRows(newData);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('file-name', encodeURIComponent('订单列表.xlsx'));
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send('导出失败');
  }
});
//获取城市数据
router.get('/cityData/:cityId', async (req, res) => {
  const { cityId } = req.params
 console.log(cityId)
  try {
   const city = await cityData.findOne({cityId})
    res.send({ code: 0, data: city.points })
  } catch (err) {
    res.status(500).send({ code: 1, msg: '读取数据失败' })
  }
})
//获取司机数据
router.get('/driver/list',async(req,res)=> {
    const {driverName,accountStatus} =req.query
    let newobj ={}
    if(driverName){
      newobj.driverName=driverName
    }
    if(accountStatus){
      newobj.accountStatus=accountStatus
    }
    console.log(newobj)
    const list = await driverList.find(newobj)

    res.send({
        code:0,
        data:{
            list:list
        },
        msg:''
    })
})
module.exports = router;

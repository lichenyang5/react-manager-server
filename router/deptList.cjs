const express = require('express')
const router = express.Router()
const Dept =require('../models/deptList.cjs')
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
// 递归清理空 children
function cleanDeptChildren(list) {
  if (!Array.isArray(list)) return;
  list.forEach(item => {
    if (item.children) {
      if (item.children.length === 0) {
        delete item.children;
      } else {
        cleanDeptChildren(item.children);
      }
    }
  });
}

// 查询部门列表
router.get('/list', async (req, res) => {
  try {
    const { deptName } = req.query;
    let list = await Dept.find({}).lean(); // lean()返回普通对象
    console.log(list)
    if (deptName) {
      list = list.filter(item => item.deptName.includes(deptName));
    }

    //cleanDeptChildren(list);

    res.send({
      code: 0,
      data: list,
      msg: 'success',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ code: 500, msg: '服务器错误' });
  }
});

// 创建部门
router.post('/create', async (req, res) => {
  try {
    const { deptName, userName, parentId } = req.body;

    const newDept = {
      _id:new Date().toString(),
      deptName,
      userName,
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      children: [],
    };

 if (parentId) {
  const result = await Dept.findOneAndUpdate(
    { "children._id": parentId }, // 查找 parentId 是否在 children 中
    { $push: { "children.$.children": newDept } }, // 在找到的 children 中 push
    { new: true }
  );

  // 如果找不到，再试顶层 parent
  if (!result) {
    const topParent = await Dept.findOneAndUpdate(
      { _id: parentId },
      { $push: { children: newDept } },
      { new: true }
    );

    if (!topParent) return res.send({ code: 1, msg: '父部门不存在' });
  }
} else {
  await Dept.create(newDept);
}
 

    res.send({ code: 0, msg: '创建成功', data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).send({ code: 500, msg: '服务器错误' });
  }
});

// 编辑部门
router.post('/edit', async (req, res) => {
  try {
    const { _id, deptName, userName } = req.body;

    // 找到部门
    const dept = await Dept.findOne({ _id });
    if (!dept) return res.send({ code: 1, msg: '部门不存在' });

    dept.deptName = deptName;
    dept.userName = userName;
    dept.updateTime = new Date().toLocaleString();

    await dept.save();

    res.send({ code: 0, msg: '编辑成功', data: dept });
  } catch (error) {
    console.error(error);
    res.status(500).send({ code: 500, msg: '服务器错误' });
  }
});

// 删除部门
async function deleteDeptRecursively(list, id) {
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    if (item._id.toString() === id) {
      list.splice(i, 1);
      return true;
    }
    if (item.children && item.children.length > 0) {
      const deleted = await deleteDeptRecursively(item.children, id);
      if (deleted) return true;
    }
  }
  return false;
}

router.post('/delete', async (req, res) => {
  try {
    const { _id } = req.body;

    // 获取所有顶级部门
    let list = await Dept.find({}).lean();
    const deleted = await deleteDeptRecursively(list, _id);
    if (!deleted) return res.send({ code: 1, msg: '部门不存在' });

    // 清空 collection 并重新插入
    await Dept.deleteMany({});
    await Dept.insertMany(list);

    res.send({ code: 0, msg: '删除成功', data: null });
  } catch (error) {
    console.error(error);
    res.status(500).send({ code: 500, msg: '服务器错误' });
  }
});
module.exports =router
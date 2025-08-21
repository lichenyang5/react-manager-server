const express = require('express')
const router = express.Router()
const menuList =require('../models/menulists.cjs')
// 递归处理 menuList，清理 button 或 children
function cleanMenuButtons(list) {
  if (!Array.isArray(list)) return
  list.forEach(item => {
    if (Array.isArray(item.children)) {
      if (item.children.length === 0) {
        // children 为空，删除 button
        delete item.button
      } else {
        // children 非空，递归处理子菜单
        cleanMenuButtons(item.children)
      }
    }
  })
}
//递归删除子元素
async function deleteMenuRecursively(list, id) {
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    if (item._id === id) {
      list.splice(i, 1); // 删除当前元素
      return true;
    }
    if (item.children && item.children.length > 0) {
      const deleted = await deleteMenuRecursively(item.children, id);
      if (deleted) return true;
    }
  }
  return false;
}
// 查询菜单列表
router.get('/list', async (req, res) => {
  try {
    const { menuName, menuState } = req.query
    let list = await menuList.find({}).lean() // lean() 返回普通对象

    // 过滤 menuName / menuState
    if (menuName) {
      list = list.filter(item => item.menuName.includes(menuName))
    }
    if (menuState) {
      list = list.filter(item => Number(item.menuState) === Number(menuState))
    }

    // 清理 button / children
    cleanMenuButtons(list)

    res.send({ code: 0, data: list, msg: '获取成功' })
  } catch (err) {
    console.error(err)
    res.status(500).send({ code: 500, msg: '服务器错误' })
  }
})

// 新增菜单
router.post('/create', async (req, res) => {
  try {
    const body = req.body
    const newMenu = {
      ...body,
      _id: Date.now().toString(), // 唯一 ID
      createTime: new Date().toISOString(),
      children: [],
      button: []
    }

    if (body.parentId) {
      // 父菜单存在则 push 新菜单到 children
      const result = await menuList.findOneAndUpdate(
        { _id: body.parentId },
        { $push: { children: newMenu } },
        { new: true }
      )

      if (!result) {
        return res.send({ code: 1, msg: '父级菜单不存在' })
      }
    } else {
      // 没有父级菜单，直接创建
      await menuList.create(newMenu)
    }

    res.send({ code: 0, msg: '创建成功' })
  } catch (err) {
    console.error(err)
    res.status(500).send({ code: 500, msg: '服务器错误' })
  }
})


// 编辑菜单
router.post('/edit', async (req, res) => {
  try {
    const body = req.body
    if (body.parentId) delete body.parentId // 防止修改父ID破坏层级

    const menu = await menuList.findOne({ _id: body._id })
    if (!menu) return res.send({ code: 1, msg: '菜单不存在' })

    // 合并更新字段
    Object.assign(menu, body)
    await menu.save()

    res.send({ code: 0, msg: '编辑成功' })
  } catch (err) {
    console.error(err)
    res.status(500).send({ code: 500, msg: '服务器错误' })
  }
})
// 删除菜单
router.post('/delete', async (req, res) => {
  try {
    const { _id } = req.body;

    // 获取所有菜单
    let menus = await menuList.find({});
    menus = menus.map(m => m.toObject()); // 转成普通对象

    const deleted = await deleteMenuRecursively(menus, _id);
    if (!deleted) return res.send({ code: 1, msg: '菜单不存在' });

    // 清空 collection，然后重新插入更新后的菜单
    await menuList.deleteMany({});
    await menuList.insertMany(menus);

    res.send({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router

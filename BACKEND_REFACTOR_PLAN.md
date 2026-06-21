# 后端重构计划

> 基于 `refactor/backend-first` 分支当前代码扫描生成，2026-06-21

---

## 1. 当前项目技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| 运行时 | Node.js | — |
| Web 框架 | Express | 5.1.0 |
| 数据库 | MongoDB（Mongoose） | 8.17.2 |
| 鉴权 | jsonwebtoken | 9.0.2 |
| 文件上传 | multer | 2.0.2 |
| Excel 导出 | exceljs | 4.4.0 |
| 模块格式 | CommonJS（.cjs） | — |

## 2. 当前目录结构

```
myreactserver/
├── index.cjs              # 启动入口 + 登录接口 + 全局鉴权中间件
├── package.json
├── tools/
│   └── connect.cjs        # MongoDB 连接
├── models/                # 15 个 model（全部 strict:false）
│   ├── usersList.cjs
│   ├── userPermissionList.cjs
│   ├── menulists.cjs
│   ├── deptList.cjs
│   ├── rolelists.cjs
│   ├── orderList.cjs
│   ├── driverlists.cjs
│   ├── cityList.cjs
│   ├── citydatas.cjs
│   ├── vehiclelists.cjs
│   ├── reportdata.cjs
│   ├── linedatas.cjs
│   ├── piecitydata.cjs
│   ├── pieagedata.cjs
│   └── radardata.cjs
├── router/                # 6 个路由文件
│   ├── userList.cjs       # /users/*
│   ├── getData.cjs        # /order/dashboard/*
│   ├── deptList.cjs       # /dept/*
│   ├── menuList.cjs       # /menu/*
│   ├── roleList.cjs       # /roles/*
│   └── orderList.cjs      # /order/*（订单/城市/车型/司机/导出）
├── public/images/         # 上传图片静态资源
├── readme
└── .gitignore
```

## 3. 当前启动方式

```bash
npm start  →  node index.cjs
```

监听端口 `3000`，无 nodemon / 热重载。

## 4. 当前 MongoDB 连接方式

- 文件：`tools/connect.cjs`
- 连接串：`mongodb://127.0.0.1/MyManager`（硬编码，无环境变量）
- 方式：顶层 `require('./tools/connect.cjs')`，模块加载时立即连接（无重试/无断线重连）

## 5. 当前 Models 清单（15 个）

| 文件 | collection 名 | _id 类型 | 用途 |
|---|---|---|---|
| usersList.cjs | userslists | ObjectId | 用户 |
| userPermissionList.cjs | userpermissionlists | ObjectId | 用户权限（写死 _id 查询） |
| menulists.cjs | menulists | String | 菜单 |
| deptList.cjs | deptlists | String | 部门 |
| rolelists.cjs | rolelists | String | 角色 |
| orderList.cjs | orderlists | String | 订单 |
| driverlists.cjs | driverlists | String | 司机 |
| cityList.cjs | citylists | String | 城市（下拉选项） |
| citydatas.cjs | citydatas | String | 城市聚合数据 |
| vehiclelists.cjs | vehiclelists | String | 车型（下拉选项） |
| reportdata.cjs | reportdatas | ObjectId | Dashboard 统计 |
| linedatas.cjs | linedatas | ObjectId | Dashboard 折线 |
| piecitydata.cjs | piecitydatas | ObjectId | Dashboard 城市饼图 |
| pieagedata.cjs | pieagedatas | ObjectId | Dashboard 年龄饼图 |
| radardata.cjs | radardatas | ObjectId | Dashboard 雷达 |

所有 Model 均 `strict: false`，无字段校验。

## 6. 当前 Router 清单

| 文件 | 挂载前缀 | 自带鉴权中间件 |
|---|---|---|
| index.cjs（内联） | `/user/login` | 否（登录接口本身） |
| router/userList.cjs | `/users` | 是（检查 req.user） |
| router/getData.cjs | `/order` | 是 |
| router/deptList.cjs | `/dept` | 是 |
| router/menuList.cjs | `/menu` | 否（缺失！依赖全局中间件） |
| router/roleList.cjs | `/roles` | 是 |
| router/orderList.cjs | `/order` | 是（但 /export 跳过） |

注意：`/order` 前缀同时挂载了 `getData.cjs`（dashboard）和 `orderList.cjs`（订单），路由靠路径后缀区分。

## 7. 当前接口清单（29 个）

### 7.1 登录 & 用户（index.cjs + router/userList.cjs）

| # | 方法 | 路径 | 文件 | 鉴权 | 请求参数 | 返回结构 |
|---|---|---|---|---|---|---|
| 1 | POST | `/user/login` | index.cjs:61 | 否 | body: `{userName, userPwd}` | `{code, data:{token}, msg}` |
| 2 | GET | `/users/getUserInfo` | router/userList.cjs:73 | 是 | 无（从 token 取 roleList） | `{code, msg, data: user}` |
| 3 | GET | `/users/getPermissionList` | router/userList.cjs:210 | 是 | 无 | `{meg, code, data}` ← 拼写 bug |
| 4 | GET | `/users/list` | router/userList.cjs:103 | 是 | query: `{state, userId, userName}` | `{code, data:{list, page}, msg}` |
| 5 | GET | `/users/all/list` | router/userList.cjs:201 | 是 | 无 | `{code, msg, data: [user]}` |
| 6 | POST | `/users/create` | router/userList.cjs:140 | 是 | body: user 对象 | `{code, msg, data: user}` |
| 7 | POST | `/users/edit` | router/userList.cjs:151 | 是 | body: `{userId, ...updates}` | `{code, msg, data: user}` |
| 8 | POST | `/users/delete` | router/userList.cjs:185 | 是 | body: `{userId: number[]}` | `{code, data, msg}` |
| 9 | POST | `/users/upload` | router/userList.cjs:59 | 是 | multipart file | `{code, msg, url}` |

### 7.2 部门（router/deptList.cjs）

| # | 方法 | 路径 | 鉴权 | 请求参数 | 返回结构 |
|---|---|---|---|---|---|
| 10 | GET | `/dept/list` | 是 | query: `{deptName}` | `{code, data: [dept], msg}` |
| 11 | POST | `/dept/create` | 是 | body: `{deptName, userName, parentId}` | `{code, msg, data}` |
| 12 | POST | `/dept/edit` | 是 | body: `{_id, deptName, userName}` | `{code, msg, data: dept}` |
| 13 | POST | `/dept/delete` | 是 | body: `{_id}` | `{code, msg, data: null}` |

### 7.3 菜单（router/menuList.cjs）

| # | 方法 | 路径 | 鉴权 | 请求参数 | 返回结构 |
|---|---|---|---|---|---|
| 14 | GET | `/menu/list` | 全局 | query: `{menuName, menuState}` | `{code, data: [menu], msg}` |
| 15 | POST | `/menu/create` | 全局 | body: `{parentId, menuName, ...}` | `{code, msg}` |
| 16 | POST | `/menu/edit` | 全局 | body: `{_id, ...updates}` | `{code, msg}` |
| 17 | POST | `/menu/delete` | 全局 | body: `{_id}` | `{code, msg}` |

### 7.4 角色（router/roleList.cjs）

| # | 方法 | 路径 | 鉴权 | 请求参数 | 返回结构 |
|---|---|---|---|---|---|
| 18 | GET | `/roles/list` | 是 | query: `{roleName}` | `{code, msg, data:{list}}` |
| 19 | GET | `/roles/alllist` | 是 | 无 | `{code, msg, data: [role]}` |
| 20 | POST | `/roles/create` | 是 | body: `{roleName, remark}` | `{code, msg, data: role}` |
| 21 | POST | `/roles/edit` | 是 | body: `{_id, ...updates}` | `{code, msg, data: role}` |
| 22 | POST | `/roles/delete` | 是 | body: `{_id}` | `{code, msg, data}` |
| 23 | POST | `/roles/updata/permission` | 是 | body: `{_id, permissionList}` | `{code, msg, data}` |

### 7.5 订单 & 司机 & 城市（router/orderList.cjs）

| # | 方法 | 路径 | 鉴权 | 请求参数 | 返回结构 |
|---|---|---|---|---|---|
| 24 | GET | `/order/list` | 是 | query: `{orderId, userName, state}` | `{code, data:{list, page}, msg}` |
| 25 | GET | `/order/detail/:orderId` | 是 | params: orderId | `{code, msg, data: order}` |
| 26 | POST | `/order/create` | 是 | body: 订单对象 | `{code, msg, data: order}` |
| 27 | POST | `/order/edit` | 是 | body: `{orderId, route}` | `{code, msg, data}` |
| 28 | POST | `/order/delete` | 是 | body: `{id}` | `{msg, code, data}` |
| 29 | POST | `/order/export` | 否 | body: 筛选参数 | Excel 二进制流 |
| 30 | GET | `/order/citylist` | 是 | 无 | `{code, data, msg}` |
| 31 | GET | `/order/vehiclelist` | 是 | 无 | `{code, data}` |
| 32 | GET | `/order/cityData/:cityId` | 是 | params: cityId | `{code, data: points}` |
| 33 | GET | `/order/driver/list` | 是 | query: `{driverName, accountStatus}` | `{code, data:{list}, msg}` |

### 7.6 Dashboard（router/getData.cjs）

| # | 方法 | 路径 | 鉴权 | 请求参数 | 返回结构 |
|---|---|---|---|---|---|
| 34 | GET | `/order/dashboard/getReportData` | 是 | 无 | `{code, msg, data}` |
| 35 | GET | `/order/dashboard/getLineData` | 是 | 无 | `{code, msg, data}` |
| 36 | GET | `/order/dashboard/getPieCityData` | 是 | 无 | `{code, msg, data}` |
| 37 | GET | `/order/dashboard/getPieAgeData` | 是 | 无 | `{code, msg, data}` |
| 38 | GET | `/order/dashboard/getRadarData` | 是 | 无 | `{code, msg, data}` |

**总计：38 个接口**

## 8. 当前登录鉴权流程

```
1. POST /user/login
   → 查 usersModel.findOne({userName})
   → 密码硬编码比较 userPwd === '111111'
   → jwt.sign({id, userName, roleList}, 'hello', {expiresIn:'10d'})
   → 返回 {code:0, data:{token}, msg}

2. 全局中间件（index.cjs:22-43）
   → 跳过 /user/login 和 /images/*
   → 取 req.headers['authorization']（裸 token，无 Bearer 前缀）
   → jwt.verify(token, 'hello')
   → 成功：req.user = decoded，next()
   → 失败：返回 {code:500001, msg:'token 失效或未登录'}

3. 路由级中间件（userList/getData/deptList/roleList/orderList）
   → 各自再检查 req.user 是否存在
   → menuList.cjs 没有路由级中间件，完全依赖全局
```

问题：
- 密码写死 `'111111'`，无 hash
- JWT secret 写死 `'hello'`
- 全局中间件在 body 解析之前，但不影响 GET 鉴权
- 路由级中间件重复检查，且错误码不统一（50001 vs 500001）

## 9. 当前统一返回结构

```json
{ "code": 0, "data": {}, "msg": "" }
```

- code = 0 成功
- code = 500001 token 失效
- code = 1 业务错误
- code = 500 服务器错误

已知偏差：
- `/users/getPermissionList` 返回 `meg` 而非 `msg`
- `/order/vehiclelist` 缺少 `msg` 字段
- `/order/delete` 返回字段顺序不一致
- 部分 500 错误用 `res.status(500).json()` 而非 `res.send()`

## 10. 当前项目主要问题

### 结构问题
1. **无分层**：路由文件直接 `Model.find()` → `res.send()`，数据访问/业务/控制器全糊在一起
2. **无统一返回工具**：每个 `res.send({code,data,msg})` 手写
3. **无统一错误处理**：try/catch 分散在各接口，错误码不一致
4. **Model 全部 strict:false**：无字段校验，无类型安全

### 鉴权问题
5. **密码硬编码**：所有账号密码均为 `'111111'`
6. **JWT secret 硬编码**：`'hello'`
7. **鉴权中间件重复**：全局一层 + 路由一层，逻辑重复
8. **错误码不统一**：50001 vs 500001

### 数据操作问题
9. **删除用全表替换**：菜单和部门的删除 = `deleteMany({})` + `insertMany(newList)`
10. **getPermissionList 写死 _id**：`68a534ea5413ed173c14a251`
11. **Dashboard 数据写死 _id**：3 个图表接口写死 ObjectId 查询

### 代码质量
12. **死代码**：`getUser()` 函数读文件但从未调用，`getRolesList()` / `updateRoleList()` 读写 JSON 文件但从未调用
13. **console.log 泛滥**：几乎每个接口都有调试日志
14. **注释复制粘贴**：所有 model 文件注释都写的 `usersList.cjs`
15. **变量名混乱**：所有 model 内部变量都叫 `userPermissionSchema` / `cityDataModel`

## 11. 后端目标分层设计

```
myreactserver/
├── index.cjs              # 入口：仅注册中间件 + 挂载路由 + 启动
├── tools/
│   └── connect.cjs        # MongoDB 连接（改用环境变量）
├── middleware/
│   └── auth.cjs           # 统一鉴权中间件
├── utils/
│   └── response.cjs       # 统一返回 success() / fail()
├── models/                # 15 个 model（保持 strict:false，不改字段）
├── service/               # 业务层（新增）
│   ├── userService.cjs
│   ├── deptService.cjs
│   ├── menuService.cjs
│   ├── roleService.cjs
│   ├── orderService.cjs
│   └── dashboardService.cjs
├── router/                # 路由层（瘦化：只做参数解析 + 调 service + 返回）
│   ├── userList.cjs
│   ├── getData.cjs
│   ├── deptList.cjs
│   ├── menuList.cjs
│   ├── roleList.cjs
│   └── orderList.cjs
└── public/images/
```

原则：
- **不改接口路径、参数、返回结构**
- **不改 MongoDB 字段**
- **不新增依赖**
- 每步可独立运行、可验证

## 12. 按接口逐步重构计划

### Phase 0 — 基础设施（不涉及业务接口）

#### Step 0.1：提取统一返回工具

新增 `utils/response.cjs`，提供 `success(data, msg)` / `fail(code, msg, data)` 两个函数。

验收：`node -e "const r = require('./utils/response.cjs'); console.log(r.success({a:1}))"`

```
commit: refactor: extract unified response utility
```

#### Step 0.2：提取统一鉴权中间件

新增 `middleware/auth.cjs`，将 `index.cjs` 的全局鉴权逻辑提取为可复用中间件。
同时移除各路由文件中的重复鉴权中间件。

验收：启动服务 → 无 token 调 `/users/list` → 返回 500001 → 带 token 调 → 正常返回。

```
commit: refactor: extract auth middleware
```

#### Step 0.3：清理 index.cjs 入口

- 登录接口保留在 index.cjs（或提取到 router/auth.cjs）
- 移除 `getUser()` 死代码
- 移除全局中间件（已提取到 middleware/auth.cjs）

验收：`npm start` → 全部接口行为不变。

```
commit: refactor: clean up entry point
```

### Phase 1 — 用户模块分层

#### Step 1.1：提取 userService.cjs

从 `router/userList.cjs` 提取数据操作到 `service/userService.cjs`：
- `getUserByRoleList(roleList)`
- `getUserList(query)`
- `getAllUsers()`
- `createUser(body)`
- `editUser(userId, updates)`
- `deleteUsers(userIds)`
- `getPermissionList()`

验收：
```bash
curl http://localhost:3000/users/getUserInfo -H "Authorization: <token>"
curl http://localhost:3000/users/list -H "Authorization: <token>"
curl http://localhost:3000/users/getPermissionList -H "Authorization: <token>"
```
返回结构不变。

```
commit: refactor: extract user service layer
```

#### Step 1.2：瘦化 router/userList.cjs

路由文件只做：解析参数 → 调 service → `res.send(success(data))`。
用 `utils/response.cjs` 替换手写 `{code, data, msg}`。
修正 `getPermissionList` 的 `meg` → `msg`。

验收：同 Step 1.1 的 curl 命令，返回结构不变（meg→msg 除外）。

```
commit: refactor: slim down user router
```

### Phase 2 — 部门模块分层

#### Step 2.1：提取 deptService.cjs

提取：
- `getDeptList(deptName)`
- `createDept(body)`
- `editDept(body)`
- `deleteDept(_id)`

验收：
```bash
curl http://localhost:3000/dept/list -H "Authorization: <token>"
```

```
commit: refactor: extract dept service layer
```

#### Step 2.2：瘦化 router/deptList.cjs

```
commit: refactor: slim down dept router
```

### Phase 3 — 菜单模块分层

#### Step 3.1：提取 menuService.cjs

提取：
- `getMenuList(query)`
- `createMenu(body)`
- `editMenu(body)`
- `deleteMenu(_id)`

验收：
```bash
curl http://localhost:3000/menu/list -H "Authorization: <token>"
```

```
commit: refactor: extract menu service layer
```

#### Step 3.2：瘦化 router/menuList.cjs + 补鉴权中间件

menuList.cjs 当前缺少路由级鉴权，补上统一中间件。

```
commit: refactor: slim down menu router and add auth
```

### Phase 4 — 角色模块分层

#### Step 4.1：提取 roleService.cjs

提取：
- `getRoleList(query)`
- `getAllRoles()`
- `createRole(body)`
- `editRole(body)`
- `deleteRole(_id)`
- `updatePermission(_id, permissionList)`

移除 `getRolesList()` / `updateRoleList()` 死代码。

验收：
```bash
curl http://localhost:3000/roles/list -H "Authorization: <token>"
```

```
commit: refactor: extract role service layer
```

#### Step 4.2：瘦化 router/roleList.cjs

```
commit: refactor: slim down role router
```

### Phase 5 — 订单 & 司机模块分层

#### Step 5.1：提取 orderService.cjs

提取：
- `getOrderList(query)`
- `getOrderDetail(orderId)`
- `createOrder(body)`
- `editOrder(body)`
- `deleteOrder(id)`
- `exportOrders(params)`
- `getCityList()`
- `getVehicleList()`
- `getCityData(cityId)`
- `getDriverList(query)`

验收：
```bash
curl http://localhost:3000/order/list -H "Authorization: <token>"
curl http://localhost:3000/order/driver/list -H "Authorization: <token>"
```

```
commit: refactor: extract order service layer
```

#### Step 5.2：瘦化 router/orderList.cjs

```
commit: refactor: slim down order router
```

### Phase 6 — Dashboard 模块分层

#### Step 6.1：提取 dashboardService.cjs

提取：
- `getReportData()`
- `getLineData()`
- `getPieCityData()`
- `getPieAgeData()`
- `getRadarData()`

验收：
```bash
curl http://localhost:3000/order/dashboard/getReportData -H "Authorization: <token>"
```

```
commit: refactor: extract dashboard service layer
```

#### Step 6.2：瘦化 router/getData.cjs

```
commit: refactor: slim down dashboard router
```

### Phase 7 — 收尾

#### Step 7.1：清理 Model 注释和变量名

所有 model 文件：
- 修正注释（不再全部写 `usersList.cjs`）
- 修正内部变量名（不再全部叫 `cityDataModel`）
- 移除 `console.log` 导出日志

不改 collection 名、不改 Schema。

```
commit: refactor: clean up model files
```

#### Step 7.2：清理调试日志

移除所有 `console.log` 调试输出（保留连接成功提示）。

```
commit: refactor: remove debug console.log statements
```

#### Step 7.3：环境变量支持

`tools/connect.cjs` 改用 `process.env.MONGODB_URI || 'mongodb://127.0.0.1/MyManager'`。
`index.cjs` 改用 `process.env.JWT_SECRET || 'hello'`。
`index.cjs` 改用 `process.env.PORT || 3000`。

不新增 `.env` 依赖库，直接用 `process.env`。

```
commit: refactor: support environment variables
```

## 13. 每一步验收方式

| 验收项 | 方法 |
|---|---|
| 服务能启动 | `npm start` 无报错 |
| 登录正常 | `curl -X POST http://localhost:3000/user/login -H 'Content-Type: application/json' -d '{"userName":"admin","userPwd":"111111"}'` |
| 带 token 接口正常 | `curl http://localhost:3000/users/getUserInfo -H "Authorization: <token>"` |
| 返回结构不变 | 对比重构前后的 JSON 输出（字段名、嵌套层级、code 值） |
| 无 token 拒绝 | `curl http://localhost:3000/users/list` → code 500001 |

## 14. 重构顺序总结

| Phase | 步骤 | 涉及文件 | commit |
|---|---|---|---|
| 0 | 0.1 统一返回 | 新增 utils/response.cjs | `refactor: extract unified response utility` |
| 0 | 0.2 统一鉴权 | 新增 middleware/auth.cjs，改 6 个 router | `refactor: extract auth middleware` |
| 0 | 0.3 清理入口 | 改 index.cjs | `refactor: clean up entry point` |
| 1 | 1.1 用户 service | 新增 service/userService.cjs | `refactor: extract user service layer` |
| 1 | 1.2 用户 router | 改 router/userList.cjs | `refactor: slim down user router` |
| 2 | 2.1-2.2 部门 | 新增 service + 改 router | `refactor: extract dept service layer` |
| 3 | 3.1-3.2 菜单 | 新增 service + 改 router | `refactor: extract menu service layer` |
| 4 | 4.1-4.2 角色 | 新增 service + 改 router | `refactor: extract role service layer` |
| 5 | 5.1-5.2 订单 | 新增 service + 改 router | `refactor: extract order service layer` |
| 6 | 6.1-6.2 Dashboard | 新增 service + 改 router | `refactor: extract dashboard service layer` |
| 7 | 7.1-7.3 收尾 | 改 models + 清 log + 环境变量 | `refactor: clean up model/log/env` |

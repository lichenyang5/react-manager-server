# NestJS 迁移计划

> 将旧 Express 后端逐步迁移到 NestJS，保持接口契约不变。

---

## 一、为什么从 Express 迁移到 NestJS

| 维度 | Express 现状 | NestJS 目标 |
|------|-------------|-------------|
| 语言 | JavaScript（.cjs） | TypeScript |
| 架构 | 无分层，router 直接操作数据库 | Module / Controller / Service 三层 |
| 依赖管理 | 手动 require | 依赖注入（DI） |
| 参数校验 | 无 | class-validator + DTO |
| 工程化 | 无 lint / 无类型 / 无测试 | eslint + tsc + jest 开箱即用 |
| 求职展示 | 毕设练习项目 | 可作为全栈工程化案例 |

迁移后可以展示：
- TypeScript 全栈能力
- 后端分层设计能力
- 数据库 Schema 设计
- JWT 鉴权 Guard
- 统一异常过滤和响应格式
- 接口文档（Swagger，可选后续接入）

---

## 二、迁移边界

### 允许

- 在 `nest-server/` 目录下新增 NestJS 项目
- 新增迁移文档和对比脚本

### 禁止

- 修改旧 Express 代码（index.cjs / router/ / models/ / tools/）
- 修改旧 React 前端
- 修改 MongoDB 数据结构（collection 名、字段名）
- 修改接口路径
- 修改请求参数
- 修改返回结构
- 修改根目录 package.json

### 历史契约问题处理

以下已知问题在迁移时**原样复刻**，除非某一步明确要求修复：

| 问题 | 所在接口 | 处理方式 |
|------|---------|---------|
| `meg` 而非 `msg` | `/users/getPermissionList` | 原样返回 `meg` |
| 缺少 `msg` 字段 | `/order/vehiclelist` | 原样不返回 `msg` |
| `data: null` | `/dept/delete` | 原样返回 `null` |
| 字段顺序 msg 在前 | `/order/delete` | JSON 序列化顺序不保证，忽略 |
| 缺少 `data` 字段 | `/menu/create`、`/menu/edit`、`/menu/delete` | 原样不返回 `data` |
| `upload` 返回 `url` 无 `data` | `/users/upload` | 原样返回 `{code, msg, url}` |
| pageSize/pageNumber 写反 | `/users/list` | 原样返回 |
| `/roles/updata/permission` 拼写 | 角色权限接口 | 原样保留路径 |

---

## 三、新旧服务并行策略

```
┌──────────────────────┐    ┌──────────────────────┐
│   旧 Express 服务     │    │   新 NestJS 服务       │
│   localhost:3000      │    │   localhost:3001       │
│   基准服务（不改）     │    │   逐步迁移             │
└──────────────────────┘    └──────────────────────┘
         │                            │
         └────── 对比验收 ─────────────┘
```

- 旧 Express 始终作为**基准服务**运行
- 新 NestJS 每迁移一个接口，用相同的 curl 请求分别打两个端口
- 对比两边返回的 JSON 结构是否一致
- 迁移全部完成后，前端才切换到新服务

---

## 四、目标 NestJS 目录结构

```
nest-server/
├── src/
│   ├── main.ts                      # 入口，监听 3001
│   ├── app.module.ts                # 根模块
│   ├── common/
│   │   ├── constants/
│   │   │   └── index.ts             # JWT_SECRET 等常量
│   │   ├── decorators/
│   │   │   └── current-user.ts      # @CurrentUser() 参数装饰器
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts    # 替代旧全局鉴权中间件
│   │   ├── interceptors/            # 预留，迁移期间不启用
│   │   └── utils/
│   │       └── response.ts          # success() / fail()
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts   # POST /user/login
│       │   ├── auth.service.ts
│       │   └── dto/
│       │       └── login.dto.ts
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts  # /users/*
│       │   ├── users.service.ts
│       │   ├── schemas/
│       │   │   ├── user.schema.ts
│       │   │   └── user-permission.schema.ts
│       │   └── dto/
│       ├── dept/
│       │   ├── dept.module.ts
│       │   ├── dept.controller.ts   # /dept/*
│       │   ├── dept.service.ts
│       │   └── schemas/
│       │       └── dept.schema.ts
│       ├── menu/
│       │   ├── menu.module.ts
│       │   ├── menu.controller.ts   # /menu/*
│       │   ├── menu.service.ts
│       │   └── schemas/
│       │       └── menu.schema.ts
│       ├── roles/
│       │   ├── roles.module.ts
│       │   ├── roles.controller.ts  # /roles/*
│       │   ├── roles.service.ts
│       │   └── schemas/
│       │       └── role.schema.ts
│       ├── order/
│       │   ├── order.module.ts
│       │   ├── order.controller.ts  # /order/*（订单 + 城市 + 车型 + 导出）
│       │   ├── order.service.ts
│       │   └── schemas/
│       │       ├── order.schema.ts
│       │       ├── city.schema.ts
│       │       ├── city-data.schema.ts
│       │       └── vehicle.schema.ts
│       ├── driver/
│       │   ├── driver.module.ts
│       │   ├── driver.controller.ts # /order/driver/*
│       │   ├── driver.service.ts
│       │   └── schemas/
│       │       └── driver.schema.ts
│       └── dashboard/
│           ├── dashboard.module.ts
│           ├── dashboard.controller.ts  # /order/dashboard/*
│           ├── dashboard.service.ts
│           └── schemas/
│               ├── report-data.schema.ts
│               ├── line-data.schema.ts
│               ├── pie-city-data.schema.ts
│               ├── pie-age-data.schema.ts
│               └── radar-data.schema.ts
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── package.json                     # 独立的 package.json
└── .gitignore
```

---

## 五、旧 Express → NestJS 映射关系

| Express | NestJS | 说明 |
|---------|--------|------|
| `router/userList.cjs` | `modules/users/users.controller.ts` | 路由 → Controller |
| router 内业务逻辑 | `modules/users/users.service.ts` | 数据操作 → Service |
| `models/usersList.cjs` | `modules/users/schemas/user.schema.ts` | Mongoose model → `@Schema()` 装饰器 |
| `index.cjs` 全局鉴权中间件 | `common/guards/jwt-auth.guard.ts` | 中间件 → Guard |
| `index.cjs` POST /user/login | `modules/auth/auth.controller.ts` | 内联路由 → Auth Controller |
| `tools/connect.cjs` | `MongooseModule.forRoot()` in `app.module.ts` | 手动连接 → NestJS Mongoose 模块 |
| `res.send({code, data, msg})` | Controller 直接返回同结构对象 | 迁移期间不用 interceptor |
| `multer` 上传配置 | `@nestjs/platform-express` + `MulterModule` | 内置支持 |
| `exceljs` 导出 | 同样使用 `exceljs` | 不换库 |

---

## 六、分阶段迁移计划

### Step 0：生成迁移计划文档 ✅ 当前步骤

只新增 `docs/NEST_MIGRATION_PLAN.md`。

---

### Step 1：初始化 NestJS 空项目

**目标**：`nest-server/` 能启动，`GET /health` 返回 `{code:0, msg:"ok"}`

**允许修改**：
- 新增 `nest-server/` 整个目录

**禁止修改**：
- 根目录任何文件
- 旧 Express 任何文件

**验收**：
```bash
cd nest-server && npm run start:dev
curl http://localhost:3001/health
# 返回 {"code":0,"msg":"ok"}
```

**commit**：`feat(nest): init nestjs project with health check`

---

### Step 2：配置 MongoDB 连接

**目标**：NestJS 连接同一个 MongoDB `MyManager` 数据库

**允许修改**：
- `nest-server/src/app.module.ts`
- 新增环境配置

**禁止修改**：
- 旧 Express 任何文件
- MongoDB 数据

**验收**：
```bash
cd nest-server && npm run start:dev
# 控制台输出 MongoDB 连接成功日志
```

**commit**：`feat(nest): configure mongodb connection`

---

### Step 3：迁移 User Schema

**目标**：定义 User 和 UserPermission 的 Mongoose Schema

**允许修改**：
- `nest-server/src/modules/users/schemas/`
- `nest-server/src/modules/users/users.module.ts`

**禁止修改**：
- 旧 Express 任何文件
- MongoDB 数据

**验收**：
```bash
cd nest-server && npx tsc --noEmit
# 编译无错误
```

**commit**：`feat(nest): add user and permission schemas`

---

### Step 4：迁移 POST /user/login

**目标**：新 NestJS 的 `/user/login` 和旧 Express 返回一致

**允许修改**：
- `nest-server/src/modules/auth/`

**禁止修改**：
- 旧 Express 任何文件

**验收**：
```bash
# 旧服务
curl -s -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","userPwd":"111111"}'

# 新服务
curl -s -X POST http://localhost:3001/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","userPwd":"111111"}'

# 对比：两边都返回 {code:0, data:{token:...}, msg:"登录成功"}
```

**commit**：`feat(nest): migrate login endpoint`

---

### Step 5：迁移 GET /users/getUserInfo

**允许修改**：
- `nest-server/src/modules/users/`
- `nest-server/src/common/guards/`

**验收**：
```bash
# 用 Step 4 获取的 token
curl -s http://localhost:3001/users/getUserInfo -H "Authorization: $TOKEN"
# 对比旧服务返回
```

**commit**：`feat(nest): migrate getUserInfo endpoint`

---

### Step 6：迁移 GET /users/getPermissionList

**注意**：必须原样返回 `{meg:'', code:0, data:...}`，保留 `meg` 拼写。

**允许修改**：
- `nest-server/src/modules/users/`

**验收**：
```bash
curl -s http://localhost:3001/users/getPermissionList -H "Authorization: $TOKEN"
# 对比旧服务返回，确认字段名为 meg
```

**commit**：`feat(nest): migrate getPermissionList endpoint`

---

### Step 7：迁移 users 列表相关接口

迁移：`/users/list`、`/users/all/list`、`/users/create`、`/users/edit`、`/users/delete`、`/users/upload`

**允许修改**：
- `nest-server/src/modules/users/`

**验收**：对每个接口分别 curl 新旧服务对比。

**commit**：`feat(nest): migrate users CRUD endpoints`

---

### Step 8：迁移 dept 接口

迁移：`/dept/list`、`/dept/create`、`/dept/edit`、`/dept/delete`

**允许修改**：
- `nest-server/src/modules/dept/`

**验收**：对每个接口分别 curl 新旧服务对比。

**commit**：`feat(nest): migrate dept endpoints`

---

### Step 9：迁移 menu 接口

迁移：`/menu/list`、`/menu/create`、`/menu/edit`、`/menu/delete`

**允许修改**：
- `nest-server/src/modules/menu/`

**验收**：对每个接口分别 curl 新旧服务对比。

**commit**：`feat(nest): migrate menu endpoints`

---

### Step 10：迁移 roles 接口

迁移：`/roles/list`、`/roles/alllist`、`/roles/create`、`/roles/edit`、`/roles/delete`、`/roles/updata/permission`

**注意**：`/roles/updata/permission` 保留 `updata` 拼写。

**允许修改**：
- `nest-server/src/modules/roles/`

**验收**：对每个接口分别 curl 新旧服务对比。

**commit**：`feat(nest): migrate roles endpoints`

---

### Step 11：迁移 order 基础接口

迁移：`/order/list`、`/order/detail/:orderId`、`/order/create`、`/order/edit`、`/order/delete`、`/order/export`、`/order/citylist`、`/order/vehiclelist`、`/order/cityData/:cityId`

**允许修改**：
- `nest-server/src/modules/order/`

**验收**：对每个接口分别 curl 新旧服务对比。

**commit**：`feat(nest): migrate order endpoints`

---

### Step 12：迁移 driver 接口

迁移：`/order/driver/list`

**允许修改**：
- `nest-server/src/modules/driver/`

**验收**：
```bash
curl -s http://localhost:3001/order/driver/list -H "Authorization: $TOKEN"
```

**commit**：`feat(nest): migrate driver endpoint`

---

### Step 13：迁移 dashboard 接口

迁移：5 个 `/order/dashboard/*` 接口

**允许修改**：
- `nest-server/src/modules/dashboard/`

**验收**：对每个接口分别 curl 新旧服务对比。

**commit**：`feat(nest): migrate dashboard endpoints`

---

### Step 14：增加对比验收脚本

新增 `scripts/compare-express-nest.sh`：同一组 curl 分别请求 3000 和 3001 端口，输出 diff。

**允许修改**：
- `scripts/compare-express-nest.sh`

**commit**：`test: add express vs nestjs comparison script`

---

### Step 15：文档收尾

更新 README、BACKEND_REFACTOR_PLAN.md 标记完成状态。

**commit**：`docs: update migration status`

---

## 七、风险控制

### 禁止提前做的事

| 禁止项 | 原因 |
|--------|------|
| 一次迁移多个模块 | 无法定位问题，回滚成本高 |
| 提前抽统一响应 interceptor | 部分接口返回结构不统一（meg、缺 msg），interceptor 会破坏契约 |
| 提前改 auth 逻辑 | 鉴权是全局的，改错影响所有接口 |
| 提前修 `meg` → `msg` | 前端可能依赖 `meg`，必须单独步骤处理 |
| 提前修路径拼写（updata） | 前端调用路径写死 |
| 提前改 seed | 不在后端迁移范围内 |
| 提前接入前端 | 全部迁移完成并验收后才切换 |
| 在 NestJS 中使用旧 Express 的 model 文件 | 重新用 `@nestjs/mongoose` 定义 Schema |

### 回退策略

- 每步一个 commit，出问题直接 `git revert`
- NestJS 项目在独立目录，最坏情况删除 `nest-server/` 即可
- 旧 Express 始终可用，不受影响

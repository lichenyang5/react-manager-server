# React Manager Server

车辆管理系统后端仓库。保留旧 Express 实现，同时新增 NestJS 后端，通过 Docker Compose 串起 MongoDB、NestJS、React 前端，一条命令启动完整系统。

## 项目背景

这个项目最初是 Node.js + Express + MongoDB 写的后端，配合 React 前端做车辆管理。能跑，但结构比较老——路由、模型、业务逻辑混在一起，没有模块化，也没有容器化。

后来决定做一次渐进式重构：

1. 旧 Express 保留不动，新建 `nest-server` 目录放 NestJS 后端。
2. 按旧接口契约逐个复刻，前端不需要改一行代码。
3. 每迁移一个接口就跑契约脚本验证，确保不破坏已有功能。
4. 最后用 Docker Compose 把前端、后端、数据库编排到一起。

不是推倒重写，是让旧项目一步步变成可交付的全栈项目。

## 当前能力

- 旧 Express 后端仍保留（`index.cjs` + `router/`）
- NestJS 后端完成全部接口迁移（`nest-server/`）
- MongoDB 通过 Docker 运行
- React 前端通过 Docker + Nginx 运行
- `docker compose up -d --build` 一键启动
- 本地已有 MongoDB 数据可迁移到 Docker
- 提供接口契约自动化检查脚本（26 项）

## 技术栈

| 层 | 技术 |
|----|------|
| 旧后端 | Express, Mongoose, JWT |
| 新后端 | NestJS, Mongoose, JWT, class-validator |
| 数据库 | MongoDB 7 |
| 前端 | React 18, Vite, Ant Design, ECharts, Zustand |
| 部署 | Docker, Docker Compose, Nginx |

## 项目结构

```
react-manager-server/
├── index.cjs                 # 旧 Express 入口
├── router/                   # 旧 Express 路由
├── models/                   # 旧 Mongoose Model
├── tools/                    # 旧工具函数
├── nest-server/              # 新 NestJS 后端
│   └── src/
│       ├── modules/          # auth, users, dept, menu, roles, order, dashboard
│       ├── common/           # guards, interceptors
│       └── main.ts           # 入口
├── scripts/                  # 接口契约检查脚本
│   ├── check-api-contract.sh
│   └── check-nest-api-contract.sh
├── docs/                     # 重构文档
├── docker-compose.yml        # Docker Compose 编排
└── docker/mongo/             # MongoDB dump 目录占位（不提交真实数据）
```

## 重构路线

### Step 0：冻结旧接口契约

先整理 `docs/API_CONTRACT_CHECKLIST.md`，写 `scripts/check-api-contract.sh`。旧接口有历史问题（拼写错误、字段不一致）也先保留，不在重构中修 bug。

### Step 1：新建 NestJS 项目

在 `nest-server/` 初始化，先实现 `/health` 和 `/health/db`，确认框架能跑、能连 MongoDB。

### Step 2：迁移登录和鉴权

- `POST /user/login`
- `GET /users/getUserInfo`
- `GET /users/getPermissionList`（注意返回字段是 `meg` 不是 `msg`）

### Step 3：迁移查询接口

用户列表、部门列表、菜单列表、角色列表、订单列表、Dashboard 图表数据。GET 请求不改数据，风险低，适合先迁。

### Step 4：迁移写操作

用户/部门/菜单/角色/订单的 create、edit、delete。写操作会改数据库，需要更谨慎。

### Step 5：迁移上传和导出

- `POST /users/upload`（文件上传）
- `POST /order/export`（Excel 文件流，不是 JSON）

### Step 6：Docker 化

MongoDB → NestJS → React 前端 → docker-compose 一键启动。

## 历史契约注意点

这些是旧 Express 遗留的"特色"，NestJS 必须原样保留：

| 问题 | 说明 |
|------|------|
| `meg` 字段 | `/users/getPermissionList` 返回 `meg`，不是 `msg` |
| `updata` 拼写 | `/roles/updata/permission` 保留历史拼写 |
| vehiclelist 无 msg | `/order/vehiclelist` 响应体没有 msg 字段 |
| token 格式 | `Authorization: <token>`，不带 Bearer 前缀 |
| order/delete 响应 | 返回结构和字段顺序保持旧 Express |
| order/export | 返回 Excel 文件流，不是 JSON |
| 集合名 | 数据库集合是 `userslists`，不是 `users` |

## 本地开发启动

### 旧 Express

```bash
npm install
npm start
# 默认端口 3000
```

### 新 NestJS

```bash
cd nest-server
npm install

# 连接本机 MongoDB（27017）
npm run start:dev

# 连接 Docker MongoDB（27018）
MONGODB_URI=mongodb://127.0.0.1:27018/MyManager npm run start:dev
```

NestJS 默认端口 3001。

## Docker 一键启动

### 前提

目录结构必须是：

```
workspace/
├── react-manager-server/   ← 你现在在这里
└── react-manager/          ← 前端仓库（兄弟目录）
```

### 启动

```bash
docker compose up -d --build
```

### 访问

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:8080 |
| 后端 | http://localhost:3001 |
| MongoDB | mongodb://127.0.0.1:27018/MyManager |

### 验证

```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/db

curl -X POST "http://localhost:3001/user/login" \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","userPwd":"111111"}'
```

## 空白电脑如何跑起来

### 1. 安装环境

必须：
- Git
- Docker Desktop

可选：
- Node.js 20（只跑 Docker 不需要）
- MongoDB Database Tools（只有导入数据时需要 `mongorestore`）

### 2. 拉代码

```bash
# 在同一个父目录下
git clone https://github.com/lichenyang5/react-manager-server.git
git clone https://github.com/lichenyang5/react-manager.git

cd react-manager-server
git checkout refactor/backend-first
```

### 3. 准备数据库数据

代码仓库**不提交真实数据库 dump**。如果只是看容器能否启动，可以先跳过这步。但如果要登录（admin / 111111），必须有数据。

```bash
# 先启动 MongoDB 容器
docker compose up -d mongo

# 把你的 dump 文件放到 docker/mongo/dump/MyManager/ 目录下
# 然后执行导入
mongorestore --uri="mongodb://127.0.0.1:27018/MyManager" \
  "./docker/mongo/dump/MyManager" --drop
```

### 4. 一键启动

```bash
docker compose up -d --build
```

### 5. 打开前端

浏览器访问 http://localhost:8080

账号：`admin`  
密码：`111111`

### 6. 验证接口

```bash
bash scripts/check-nest-api-contract.sh
```

应该看到 26 passed / 0 failed。

## 常见问题

### 3001 端口被占用

本机 NestJS 和 Docker NestJS 不能同时跑。停本地的：

```bash
# 找到占用 3001 的进程
lsof -i :3001
# 或者停 Docker 的
docker compose stop nest-api
```

### 8080 端口被占用

```bash
# 看谁在用
lsof -i :8080
# 停掉旧容器，或改 docker-compose.yml 端口为 8081:80
```

### Docker MongoDB 没有数据，登录失败

容器里是空库。必须执行 `mongorestore` 导入数据后才能登录。

### Found orphan containers 警告

之前 compose 遗留的旧服务容器：

```bash
docker compose up -d --remove-orphans
```

### 前端能打开但接口失败

1. 检查 NestJS 是否启动：`docker compose logs nest-api`
2. 健康检查：`curl http://localhost:3001/health`
3. 看浏览器 Console 是否有 CORS 报错

### CORS 报错

NestJS 已启用 CORS。如果仍报错，检查 `nest-server/src/main.ts` 中是否有 `app.enableCors()`。

### db.users.findOne() 查不到数据

集合名是 `userslists`，不是 `users`。用 `show collections` 看真实集合名。

### 真实 dump 不要提交

`.gitignore` 已配置忽略 `docker/mongo/dump/*`。如果 git status 看到 dump 文件，不要 add。

## 接口验收

```bash
# 旧 Express（端口 3000）
bash scripts/check-api-contract.sh

# 新 NestJS（端口 3001）
bash scripts/check-nest-api-contract.sh
```

## 后续计划

1. 补 seed 脚本，解决空白电脑没有数据的问题
2. 把旧 Express 标记为 legacy
3. CI 中跑 NestJS build + 接口契约脚本
4. 补单元测试

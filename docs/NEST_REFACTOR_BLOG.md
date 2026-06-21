# 从 Express 老项目到 NestJS + Docker：一次车辆管理系统的渐进式重构

> 不是推倒重写，而是让旧项目一步步变成可交付的全栈项目。

## 1. 为什么要重构

这个项目是我之前写的车辆管理系统——React 前端 + Express 后端 + MongoDB。功能不复杂：用户管理、部门管理、菜单管理、角色管理、订单管理、Dashboard 图表。能跑，但有几个问题：

1. Express 路由文件里既写业务逻辑又写数据库操作，没有分层。
2. 没有统一的错误处理、没有参数校验、没有模块化。
3. 本地跑需要装 MongoDB，换台电脑就跑不起来。
4. 想拿来做全栈项目展示，但"能跑"和"别人也能跑"是两回事。

一开始想过直接用 NestJS 从头写，但转念一想——前端还在用旧接口，如果后端接口签名变了，前端也得跟着改，改着改着两边都崩了。

最后选了一条更稳的路：**渐进式重构**。旧 Express 不动，新 NestJS 在旁边一个接口一个接口地迁。每迁完一个就跑脚本验证，前端完全不用改。

## 2. 我没有直接推倒重写

很多人重构的第一反应是开个新分支从零开始写。听起来爽，但我之前试过，写到一半发现旧接口里有一堆隐式约定——字段名拼错了、响应结构不一致、某些接口没有 msg 字段。如果推倒重写，这些坑全得重新踩一遍。

所以这次的做法是：

- 旧 Express 保留在仓库根目录（`index.cjs` + `router/` + `models/`）
- 新 NestJS 放在 `nest-server/` 子目录
- 两套服务可以同时存在，互不干扰
- 前端只需要把 API 地址从 3000 换成 3001，其他不动

这样每一步都能回滚。如果哪个接口迁移出了问题，切回旧端口就行。

## 3. 第一步不是写代码，而是冻结接口契约

这一步最容易被跳过，但其实最重要。

在开始写 NestJS 之前，我先做了两件事：

1. 把旧 Express 的所有接口整理成一份清单（`docs/API_CONTRACT_CHECKLIST.md`）
2. 写了一个 shell 脚本自动验证接口响应（`scripts/check-api-contract.sh`）

整理的过程中发现了不少"历史特色"：

- `/users/getPermissionList` 的响应里，字段名是 `meg`，不是 `msg`。应该是当初写错了，但前端已经用了这个字段。
- `/roles/updata/permission`——对，是 `updata`，不是 `update`。
- `/order/vehiclelist` 的响应里压根没有 `msg` 字段，其他接口都有。
- token 放在 `Authorization` header 里，但不带 `Bearer` 前缀。直接就是裸 token。

这些问题要不要修？**不修。**

重构的目标是迁移，不是修 bug。如果一边迁移一边修旧问题，前端就得跟着改，复杂度会爆炸。先原样复刻，等全部迁完、前端接入成功之后，再单独开 PR 修这些历史遗留。

## 4. NestJS 怎么迁

迁移顺序不是随意定的，我按风险从低到高排：

```
/health, /health/db          ← 先确认框架能跑
/user/login                  ← 鉴权是所有接口的前置条件
/users/getUserInfo           ← 登录后第一个请求
/users/getPermissionList     ← 动态菜单依赖它
GET 查询接口（用户、部门、菜单、角色、订单、Dashboard）
POST 写操作（create、edit、delete）
上传（/users/upload）
导出（/order/export）
```

为什么这么排：

- `/health` 是最简单的，只是确认 NestJS 项目结构没问题。
- 登录必须先迁，因为后续所有接口都依赖 token。
- GET 查询不改数据库，即使写错了也不会污染数据。
- POST 写操作会改数据，出错可能把测试数据搞乱。
- 上传和导出是特殊接口（一个处理文件，一个返回二进制流），复杂度最高，放最后。

每迁完一组接口，就跑一遍 `scripts/check-nest-api-contract.sh`，确认没有回归。

## 5. 为什么查询接口和写接口要分开

这一步不能急。

GET 查询接口的好处是：写错了不会造成任何后果。数据库里该什么样还是什么样，最多就是返回格式不对，前端显示有问题，改了再试就行。

但写操作不一样。`POST /users/create` 如果参数处理不对，可能会往数据库里插一条脏数据。`POST /order/delete` 如果条件写错了，可能删多了。所以写操作单独一轮，用测试数据验证完再合并。

上传和导出就更特殊了：

- `/users/upload` 需要处理 multipart/form-data，Multer 配置路径、文件名规则都要对。
- `/order/export` 返回的是 Excel 文件流（`application/vnd.openxmlformats`），不是 JSON。响应拦截器不能对它做 `JSON.parse`。

这两个放最后，避免一开始就被文件处理的问题卡住。

## 6. 最容易踩坑的几个点

整个重构过程中，翻车最多的不是"怎么写 NestJS"，而是这些细节：

### meg 不是 msg

`/users/getPermissionList` 返回的权限列表，旧 Express 用的字段名是 `meg`。我一开始想当然地写了 `msg`，结果前端菜单渲染不出来。排查了半天才发现这个拼写差异。

### updata 不是 update

`/roles/updata/permission` 这个路由，`updata` 是旧代码写错了。但前端调的就是这个 URL，所以 NestJS 也得保持这个拼写。改了就 404。

### token 不带 Bearer

很多教程里 JWT 认证用的是 `Bearer <token>` 格式。但这个项目旧 Express 的实现是直接把 token 裸放在 `Authorization` header 里。NestJS 的 Guard 如果按标准写 `split('Bearer ')[1]`，就会解析失败。

### Docker 里 MongoDB 不能用 127.0.0.1:27018

容器内部的 NestJS 连 MongoDB，不能用宿主机的映射端口。要用 Docker Compose 的服务名：

```
mongodb://mongo:27017/MyManager    ← 容器内用这个
mongodb://127.0.0.1:27018/MyManager  ← 宿主机用这个
```

这个错误不会报"连接被拒绝"，而是会卡住很久然后超时，排查起来很痛苦。

### 浏览器访问前端时，API 不能写 nest-api:3001

前端是在浏览器里跑的，浏览器在宿主机上。`nest-api` 是 Docker 内部的服务名，浏览器解析不了。API 地址必须是 `http://localhost:3001`。

### 集合名是 userslists 不是 users

MongoDB 里的集合名不是你以为的 `users`、`orders`，而是 `userslists`、`orderlists`。如果 Mongoose Schema 没有指定 collection 名，NestJS 会按自己的规则推导，结果查出来是空的。

### 本机 Nest 和 Docker Nest 同时跑

端口 3001 只能被一个进程占用。如果本地 `npm run start:dev` 还开着，Docker 容器就起不来。反过来也一样。`EADDRINUSE` 这个错经常忘了是这个原因。

## 7. Docker 化：把项目变成可交付

"能跑"和"别人也能跑"是两回事。

本地开发时，我的电脑上有 MongoDB、有 Node.js、有正确的环境变量。但换一台电脑，或者交给别人看，就得重新配置一遍。Docker 解决的就是这个问题。

Docker 化分了四步：

**第一步：Docker 化 MongoDB**

最简单的一步。MongoDB 官方镜像拿来直接用，把端口映射到 27018（避免和本机 MongoDB 冲突），数据用 volume 持久化。

旧数据怎么办？`mongodump` 导出，`mongorestore` 导入。不复杂，但有一点要注意：**dump 文件不要提交到 Git**。数据库里有用户密码（虽然是 MD5），不适合公开。

**第二步：Docker 化 NestJS**

用多阶段构建：

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main"]
```

第一阶段装所有依赖、编译 TypeScript。第二阶段只装生产依赖、拷贝编译产物。最终镜像不含 TypeScript 源码和 devDependencies，体积小很多。

**第三步：Docker 化 React 前端**

前端构建完就是一堆静态文件，用 Nginx 托管就行：

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
```

有一个关键配置：前端的 API 地址必须在构建时注入 `VITE_BASE_API=http://localhost:3001`。因为浏览器直接请求后端，不经过 Nginx 代理。相应地，NestJS 要开启 CORS。

**第四步：docker-compose 编排**

```yaml
services:
  mongo:
    image: mongo:7
    ports: ["27018:27017"]
    volumes: [mongo-data:/data/db]

  nest-api:
    build: { context: ./nest-server }
    ports: ["3001:3001"]
    environment:
      MONGODB_URI: mongodb://mongo:27017/MyManager
    depends_on: [mongo]

  web:
    build: { context: ../react-manager }
    ports: ["8080:80"]
    depends_on: [nest-api]
```

注意 `web` 的 build context 是 `../react-manager`——前端仓库是后端仓库的兄弟目录，不是子目录。

## 8. 空白电脑如何启动

拿到代码后的完整流程：

```bash
# 1. 拉代码（在同一个父目录下）
git clone https://github.com/lichenyang5/react-manager-server.git
git clone https://github.com/lichenyang5/react-manager.git

# 2. 切到重构分支
cd react-manager-server
git checkout refactor/backend-first

# 3. 启动 MongoDB（先把数据准备好）
docker compose up -d mongo

# 4. 导入数据（如果你有 dump 文件的话）
mongorestore --uri="mongodb://127.0.0.1:27018/MyManager" \
  "./docker/mongo/dump/MyManager" --drop

# 5. 一键启动全部
docker compose up -d --build

# 6. 验证
curl http://localhost:3001/health
# 打开 http://localhost:8080，用 admin / 111111 登录
```

如果没有数据库 dump，容器能启动但登录会失败（因为数据库里没有 admin 用户）。这不是 bug，是数据还没导入。

## 9. 最后项目变成什么样

```
react-manager-server/
├── index.cjs           # legacy Express（保留，不再维护）
├── nest-server/        # 主后端（NestJS）
├── docker-compose.yml  # 一键编排
└── scripts/            # 契约检查脚本

react-manager/
├── src/                # React 前端
├── Dockerfile          # Docker 构建
└── nginx.conf          # 生产 Nginx 配置
```

三个容器：

| 容器 | 职责 | 访问地址 |
|------|------|---------|
| react-manager-mongo | MongoDB 数据库 | localhost:27018 |
| react-manager-nest-api | NestJS API 服务 | localhost:3001 |
| react-manager-web | React 前端（Nginx） | localhost:8080 |

旧 Express 还在，但已经是 legacy。新功能只在 NestJS 上开发。前端从 Vite 开发代理切换到了直连 `http://localhost:3001`，NestJS 通过 CORS 支持跨域。

有一个自动化脚本 `scripts/check-nest-api-contract.sh` 验证 26 个接口点，确保迁移没有遗漏和回归。

## 10. 这次重构最大的收获

不写鸡汤，说具体的：

**先锁契约再重构。** 没有契约清单和自动验证脚本，重构就是盲人摸象。你以为改完了，其实漏了一个字段、少了一个 header、响应码不对。脚本能在 10 秒内告诉你哪里不对。

**把大重构拆成小步。** 一次性迁移 20 个接口，出了问题不知道是哪个改坏的。一次迁 3-5 个，跑一轮脚本，心里有底。

**Docker 化的价值不是"炫技"。** 它解决的是"换一台电脑还能不能跑"这个最基本的问题。如果你的项目只有你自己能跑起来，那它只是个本地 demo。

**处理历史包袱比写新代码难。** `meg`、`updata`、裸 token、不规范的集合名——这些不是你的错，但重构时你得兼容它们。"正确"和"能用"之间要选后者，至少在迁移阶段。

**让项目从"能跑"变成"别人也能跑"。** README 写清楚了、Docker 配好了、数据迁移有文档了、验证有脚本了——这才是一个可以交出去的项目。

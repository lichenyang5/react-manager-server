# Docker 环境搭建

## 项目目录要求

```
父目录/
├── react-manager-server/   ← 后端仓库（docker-compose.yml 在此）
└── react-manager/          ← 前端仓库
```

## 一键启动完整系统

```bash
docker compose up -d --build
```

启动三个服务：

| 服务 | 容器名 | 宿主机访问 |
|------|--------|-----------|
| mongo | react-manager-mongo | `mongodb://127.0.0.1:27018/MyManager` |
| nest-api | react-manager-nest-api | `http://localhost:3001` |
| web | react-manager-web | `http://localhost:8080` |

## 查看容器

```bash
docker ps
```

应看到三个容器状态为 `Up`。

## 查看日志

```bash
docker compose logs -f mongo
docker compose logs -f nest-api
docker compose logs -f web
```

## 验证后端

```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/db
```

## 验证登录

```bash
curl -X POST "http://localhost:3001/user/login" \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","userPwd":"111111"}'
```

## 验证前端

1. 浏览器打开 http://localhost:8080
2. 登录账号：`admin`，密码：`111111`
3. 打开浏览器 Network 面板确认：
   - `/user/login` 请求 `http://localhost:3001`
   - `/users/getUserInfo` 请求 `http://localhost:3001`
   - `/users/getPermissionList` 请求 `http://localhost:3001`

## 全量接口验收

```bash
bash scripts/check-nest-api-contract.sh
```

---

## 数据库说明

如果 Docker MongoDB 里还没有数据，需要先执行数据迁移。

**不要把真实 dump 数据提交到 GitHub。** `.gitignore` 已配置忽略 `docker/mongo/dump/*`。

### 导出本地数据

```bash
mongodump --uri="mongodb://127.0.0.1:27017/MyManager" --out="./docker/mongo/dump"
```

### 导入到 Docker MongoDB

```bash
mongorestore --uri="mongodb://127.0.0.1:27018/MyManager" "./docker/mongo/dump/MyManager" --drop
```

### 验证导入

```bash
mongosh "mongodb://127.0.0.1:27018/MyManager"
```

```javascript
show collections
db.userslists.findOne()
db.orderlists.countDocuments()
```

### 集合清单

| 集合名 | 说明 |
|--------|------|
| userslists | 用户列表 |
| userpermissionlists | 用户权限 |
| menulists | 菜单列表 |
| deptlists | 部门列表 |
| rolelists | 角色列表 |
| orderlists | 订单列表 |
| citylists | 城市列表 |
| vehiclelists | 车型列表 |
| driverlists | 司机列表 |
| reportdatas | 报表数据 |
| linedatas | 折线图数据 |
| piecitydatas | 饼图城市数据 |
| pieagedatas | 饼图年龄数据 |
| radardatas | 雷达图数据 |
| citydatas | 城市坐标数据 |

---

## 连接配置

| 场景 | MONGODB_URI |
|------|-------------|
| Docker 容器内（compose 服务互联） | `mongodb://mongo:27017/MyManager` |
| 宿主机本地开发连 Docker MongoDB | `mongodb://127.0.0.1:27018/MyManager` |
| 宿主机连本地原生 MongoDB | `mongodb://127.0.0.1:27017/MyManager` |

## 架构说明

- 前端使用 nginx:alpine 提供静态文件服务
- SPA 路由通过 `try_files` 指令支持（刷新不 404）
- 前端直接请求 `http://localhost:3001`（NestJS 后端），无 nginx 反向代理
- NestJS 已启用 CORS（`app.enableCors({ origin: true, credentials: true })`）
- 前端构建时通过 `VITE_BASE_API=http://localhost:3001` 注入 API 地址

## 本地开发（不用 Docker 运行 NestJS）

如果只想用 Docker MongoDB，NestJS 本地运行：

```bash
cd nest-server
MONGODB_URI=mongodb://127.0.0.1:27018/MyManager npm run start:dev
```

---

## 常见问题

### 问题 A：3001 端口被占用

如果本机正在 `npm run start:dev`，需要停止本机 NestJS：

```bash
# 停止本地 NestJS 进程
# 或者停止容器
docker compose stop nest-api
```

### 问题 B：8080 端口被占用

停止旧 web 容器或修改 compose 端口：

```yaml
ports:
  - "8081:80"
```

### 问题 C：出现 Found orphan containers

这是之前 compose 中遗留的旧服务容器。确认不用后执行：

```bash
docker compose up -d --remove-orphans
```

### 问题 D：前端能打开但接口失败

检查：

1. NestJS 是否启动：`docker compose logs nest-api`
2. 健康检查：`curl http://localhost:3001/health`
3. 前端环境变量是否指向 `http://localhost:3001`
4. 浏览器 Console 是否有 CORS 报错

---

## 完成状态

1. ~~Docker 化 MongoDB~~ ✓
2. ~~Docker 化 NestJS 后端~~ ✓
3. ~~Docker 化 React 前端~~ ✓
4. ~~docker compose 一键启动全部服务~~ ✓

# Docker 环境搭建

## 当前目标

分阶段将车辆管理系统 Docker 化：

1. **Step 1（本文档）**：Docker 化 MongoDB，迁移本地数据
2. Step 2：Docker 化 NestJS 后端
3. Step 3：Docker 化 React 前端
4. Step 4：docker compose 一键启动全部服务

## 为什么先 Docker 化 MongoDB

- MongoDB 是无状态服务中最容易容器化的
- 本地已有数据可以通过 mongodump/mongorestore 迁移
- Docker MongoDB 启动后，NestJS 只需改连接串即可使用
- 不影响已有接口契约

## 启动 Docker MongoDB

```bash
docker compose up -d mongo
```

确认容器运行：

```bash
docker ps
```

应看到 `react-manager-mongo` 容器状态为 `Up`。

## 端口说明

docker-compose.yml 默认配置为 **27018:27017**（方案 B），原因：

- 本地 MongoDB 通常占用 27017
- 使用 27018 映射避免端口冲突
- 本地原数据库不受影响

### 方案 A：停止本地 MongoDB，Docker 使用 27017

如果你不需要保留本地 MongoDB 运行：

1. 停止本地 MongoDB：
   ```bash
   brew services stop mongodb-community
   # 或
   sudo systemctl stop mongod
   ```

2. 修改 docker-compose.yml 端口映射：
   ```yaml
   ports:
     - "27017:27017"
   ```

3. 启动 Docker MongoDB：
   ```bash
   docker compose up -d mongo
   ```

4. NestJS 连接串不变：
   ```
   mongodb://127.0.0.1:27017/MyManager
   ```

### 方案 B（推荐）：Docker 使用 27018，不影响本地 MongoDB

当前 docker-compose.yml 已配置为此方案，无需修改。

NestJS 连接串需改为：
```
mongodb://127.0.0.1:27018/MyManager
```

容器内服务互联时使用：
```
mongodb://mongo:27017/MyManager
```

## 数据迁移

本地 MyManager 数据库不能直接塞进 Docker 镜像，需通过 mongodump/mongorestore 迁移。

**不要把真实 dump 数据提交到 Git。** `.gitignore` 已配置忽略 `docker/mongo/dump/*`。

### 第一步：导出本地数据

```bash
mongodump --uri="mongodb://127.0.0.1:27017/MyManager" --out="./docker/mongo/dump"
```

导出后 `docker/mongo/dump/MyManager/` 目录下会有各集合的 `.bson` 和 `.metadata.json` 文件。

### 第二步：确认 Docker MongoDB 已启动

```bash
docker ps | grep react-manager-mongo
```

### 第三步：导入数据到 Docker MongoDB

方案 B（端口 27018）：

```bash
mongorestore --uri="mongodb://127.0.0.1:27018/MyManager" "./docker/mongo/dump/MyManager" --drop
```

方案 A（端口 27017）：

```bash
mongorestore --uri="mongodb://127.0.0.1:27017/MyManager" "./docker/mongo/dump/MyManager" --drop
```

`--drop` 参数会先清空目标集合再导入，确保数据一致。

### 第四步：验证导入成功

```bash
mongosh "mongodb://127.0.0.1:27018/MyManager"
```

在 mongosh 中执行：

```javascript
show collections
db.userslists.findOne()
db.orderlists.countDocuments()
```

应能看到与本地相同的集合和数据。

## 集合清单

导入后 Docker MongoDB 中应包含以下集合：

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

## NestJS Docker 化

### 构建并启动

```bash
docker compose up -d --build mongo nest-api
```

### 查看容器状态

```bash
docker ps
```

应看到 `react-manager-mongo` 和 `react-manager-nest-api` 两个容器。

### 查看 NestJS 日志

```bash
docker compose logs -f nest-api
```

### 连接配置

| 场景 | MONGODB_URI |
|------|-------------|
| Docker 容器内（compose 服务互联） | `mongodb://mongo:27017/MyManager` |
| 宿主机本地开发连 Docker MongoDB | `mongodb://127.0.0.1:27018/MyManager` |
| 宿主机连本地原生 MongoDB | `mongodb://127.0.0.1:27017/MyManager` |

### 验证

```bash
# 健康检查
curl http://localhost:3001/health
curl http://localhost:3001/health/db

# 登录
curl -X POST "http://localhost:3001/user/login" \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","userPwd":"111111"}'

# 全量接口验收
bash scripts/check-nest-api-contract.sh
```

### 本地开发（不用 Docker 运行 NestJS）

如果只想用 Docker MongoDB，NestJS 本地运行：

```bash
cd nest-server
MONGODB_URI=mongodb://127.0.0.1:27018/MyManager npm run start:dev
```

## 后续步骤

1. ~~Docker 化 MongoDB~~ ✓
2. ~~Docker 化 NestJS 后端~~ ✓
3. Docker 化 React 前端（nginx + 静态文件）
4. 最终 `docker compose up` 一键启动全部服务

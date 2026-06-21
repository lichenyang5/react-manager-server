# NestJS 接口契约验收清单

## 概览

| 模块 | 已迁移 | 自动脚本覆盖 | 需手动验收 |
|------|--------|-------------|-----------|
| 基础 (health/login) | 3 | 3 | 0 |
| 用户查询 | 4 | 4 | 0 |
| 用户写操作 | 3 | 0 | 3 |
| 用户上传 | 1 | 1 | 0 |
| 部门查询 | 1 | 1 | 0 |
| 部门写操作 | 3 | 0 | 3 |
| 菜单查询 | 1 | 1 | 0 |
| 菜单写操作 | 3 | 0 | 3 |
| 角色查询 | 2 | 2 | 0 |
| 角色写操作 | 4 | 0 | 4 |
| 订单查询 | 4 | 4 | 0 |
| 订单详情 | 2 | 2 | 0 |
| 订单写操作 | 3 | 0 | 3 |
| 订单导出 | 1 | 1 | 0 |
| Dashboard | 5 | 5 | 0 |
| **合计** | **40** | **24** | **16** |

---

## 接口明细

### 基础

| 路径 | 方法 | 已迁移 | 自动覆盖 | 备注 |
|------|------|--------|---------|------|
| /health | GET | Yes | Yes | |
| /health/db | GET | Yes | Yes | |
| /user/login | POST | Yes | Yes | |

### 用户模块

| 路径 | 方法 | 已迁移 | 自动覆盖 | 备注 |
|------|------|--------|---------|------|
| /users/getUserInfo | GET | Yes | Yes | |
| /users/list | GET | Yes | Yes | hardcoded page: pageSize=1, pageNumber=10 |
| /users/all/list | GET | Yes | Yes | |
| /users/getPermissionList | GET | Yes | Yes | **历史契约: 返回 `meg` 不是 `msg`** |
| /users/create | POST | Yes | No | userId = Date.now() |
| /users/edit | POST | Yes | No | findOneAndUpdate by userId |
| /users/delete | POST | Yes | No | deleteMany, userId 为数组 |
| /users/upload | POST | Yes | Yes | 字段名 file, 文件名 Date.now()+ext |

### 部门模块

| 路径 | 方法 | 已迁移 | 自动覆盖 | 备注 |
|------|------|--------|---------|------|
| /dept/list | GET | Yes | Yes | 支持 deptName 筛选 |
| /dept/create | POST | Yes | No | _id = new Date().toString() |
| /dept/edit | POST | Yes | No | |
| /dept/delete | POST | Yes | No | 递归删除 + deleteMany + insertMany |

### 菜单模块

| 路径 | 方法 | 已迁移 | 自动覆盖 | 备注 |
|------|------|--------|---------|------|
| /menu/list | GET | Yes | Yes | 支持 menuName/menuState 筛选 |
| /menu/create | POST | Yes | No | _id = Date.now().toString() |
| /menu/edit | POST | Yes | No | Object.assign + save |
| /menu/delete | POST | Yes | No | 递归删除 + deleteMany + insertMany |

### 角色模块

| 路径 | 方法 | 已迁移 | 自动覆盖 | 备注 |
|------|------|--------|---------|------|
| /roles/list | GET | Yes | Yes | 支持 roleName 筛选 |
| /roles/alllist | GET | Yes | Yes | |
| /roles/create | POST | Yes | No | _id = new Date().toISOString() |
| /roles/edit | POST | Yes | No | |
| /roles/delete | POST | Yes | No | |
| /roles/updata/permission | POST | Yes | No | **历史契约: 路径拼写 updata 不是 update** |

### 订单模块

| 路径 | 方法 | 已迁移 | 自动覆盖 | 备注 |
|------|------|--------|---------|------|
| /order/list | GET | Yes | Yes | page 使用 pageNum (不是 pageNumber) |
| /order/citylist | GET | Yes | Yes | |
| /order/vehiclelist | GET | Yes | Yes | **历史契约: 没有 msg 字段** |
| /order/driver/list | GET | Yes | Yes | data 格式: {list:[...]} |
| /order/detail/:orderId | GET | Yes | Yes | 用 orderId 字段查询 |
| /order/cityData/:cityId | GET | Yes | Yes | 返回 city.points 数组 |
| /order/create | POST | Yes | No | _id=Date.now().toString(), orderId='T'+Date.now() |
| /order/edit | POST | Yes | No | 只更新 route 字段, 返回旧文档 |
| /order/delete | POST | Yes | No | body.id 对应 orderId |
| /order/export | POST | Yes | Yes | **历史契约: 文件流, 不是 JSON; 不需要 token** |

### Dashboard 模块

| 路径 | 方法 | 已迁移 | 自动覆盖 | 备注 |
|------|------|--------|---------|------|
| /order/dashboard/getReportData | GET | Yes | Yes | |
| /order/dashboard/getLineData | GET | Yes | Yes | |
| /order/dashboard/getPieCityData | GET | Yes | Yes | |
| /order/dashboard/getPieAgeData | GET | Yes | Yes | |
| /order/dashboard/getRadarData | GET | Yes | Yes | |

---

## 历史契约注意点

1. **`/users/getPermissionList`** — 返回字段是 `meg`，不是 `msg`。这是旧 Express 的历史 typo，必须保持。
2. **`/order/vehiclelist`** — 返回 `{code:0, data:[...]}` 没有 `msg` 字段。
3. **`/roles/updata/permission`** — 路径拼写为 `updata`，不是 `update`。历史契约不修复。
4. **`/order/delete`** — 返回字段顺序为 `{msg, code, data}`，NestJS 保持一致。
5. **Authorization** — 默认使用 `Authorization: <token>`（裸 token），不强制 Bearer 前缀。
6. **`/order/export`** — 返回 Excel 文件流，不是 JSON。不需要 token（旧 Express middleware 跳过鉴权）。
7. **path 大小写和拼写** — 所有路径保持旧 Express 原样，不做修正。
8. **`/users/list` page** — hardcoded `pageSize:1, pageNumber:10`，这是旧 Express 历史行为。
9. **`/order/edit`** — `findOneAndUpdate` 不带 `{new:true}`，返回更新前的旧文档。

---

## 验收脚本

| 脚本 | 目标 | 端口 |
|------|------|------|
| `scripts/check-api-contract.sh` | 旧 Express | localhost:3000 |
| `scripts/check-nest-api-contract.sh` | NestJS | localhost:3001 |

运行方式：

```bash
# NestJS 验收
bash scripts/check-nest-api-contract.sh

# 自定义地址
BASE="http://localhost:3001" bash scripts/check-nest-api-contract.sh

# 手动传入 token
TOKEN="eyJhbGci..." bash scripts/check-nest-api-contract.sh
```

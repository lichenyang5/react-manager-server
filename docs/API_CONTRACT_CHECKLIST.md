# 接口契约清单

> 后端重构期间的接口契约基线。
> 除非某一步明确要求修复，否则返回结构必须保持不变——包括已知的历史问题。

---

## 通用返回结构

```json
{ "code": 0, "data": {}, "msg": "" }
```

| code | 含义 |
|------|------|
| 0 | 成功 |
| 1 | 业务错误 |
| 500 | 服务器错误 |
| 500001 | token 失效 / 未登录 |

---

## 1. 登录（index.cjs）

| 路径 | 方法 | Token | 请求参数 | 返回结构 | 已知问题 |
|------|------|-------|----------|----------|----------|
| `/user/login` | POST | 否 | body: `{userName, userPwd}` | `{code, data:{token}, msg}` | 密码硬编码 `111111`，不在本轮修复 |

---

## 2. 用户（router/userList.cjs → `/users`）

| 路径 | 方法 | Token | 请求参数 | 返回结构 | 已知问题 |
|------|------|-------|----------|----------|----------|
| `/users/getUserInfo` | GET | 是 | 无（从 token 取 roleList） | `{code, msg, data: user}` | — |
| `/users/getPermissionList` | GET | 是 | 无 | `{meg, code, data}` | **字段 `meg` 而非 `msg`，保留不修** |
| `/users/list` | GET | 是 | query: `{state, userId, userName}` | `{code, data:{list, page:{pageSize,pageNumber,total}}, msg}` | pageSize/pageNumber 值写反，保留不修 |
| `/users/all/list` | GET | 是 | 无 | `{code, msg, data: [user]}` | — |
| `/users/create` | POST | 是 | body: user 对象 | `{code, msg, data: user}` | — |
| `/users/edit` | POST | 是 | body: `{userId, ...updates}` | `{code, msg, data: user}` | — |
| `/users/delete` | POST | 是 | body: `{userId: number[]}` | `{code, data:{}, msg}` | — |
| `/users/upload` | POST | 是 | multipart `file` | `{code, msg, url}` | 返回无 `data` 字段，保留不修 |

---

## 3. 部门（router/deptList.cjs → `/dept`）

| 路径 | 方法 | Token | 请求参数 | 返回结构 | 已知问题 |
|------|------|-------|----------|----------|----------|
| `/dept/list` | GET | 是 | query: `{deptName}` | `{code, data: [dept], msg}` | — |
| `/dept/create` | POST | 是 | body: `{deptName, userName, parentId}` | `{code, msg, data:{}}` | — |
| `/dept/edit` | POST | 是 | body: `{_id, deptName, userName}` | `{code, msg, data: dept}` | — |
| `/dept/delete` | POST | 是 | body: `{_id}` | `{code, msg, data: null}` | data 为 null 而非 {}，保留不修 |

---

## 4. 菜单（router/menuList.cjs → `/menu`）

| 路径 | 方法 | Token | 请求参数 | 返回结构 | 已知问题 |
|------|------|-------|----------|----------|----------|
| `/menu/list` | GET | 是 | query: `{menuName, menuState}` | `{code, data: [menu], msg}` | 无路由级鉴权中间件，保留不修 |
| `/menu/create` | POST | 是 | body: `{parentId, menuName, icon, menuType, menuState, path, component, orderBy}` | `{code, msg}` | 缺少 `data` 字段，保留不修 |
| `/menu/edit` | POST | 是 | body: `{_id, ...updates}` | `{code, msg}` | 缺少 `data` 字段，保留不修 |
| `/menu/delete` | POST | 是 | body: `{_id}` | `{code, msg}` | 缺少 `data` 字段，保留不修 |

---

## 5. 角色（router/roleList.cjs → `/roles`）

| 路径 | 方法 | Token | 请求参数 | 返回结构 | 已知问题 |
|------|------|-------|----------|----------|----------|
| `/roles/list` | GET | 是 | query: `{roleName}` | `{code, msg, data:{list}}` | — |
| `/roles/alllist` | GET | 是 | 无 | `{code, msg, data: [role]}` | — |
| `/roles/create` | POST | 是 | body: `{roleName, remark}` | `{code, msg, data: role}` | — |
| `/roles/edit` | POST | 是 | body: `{_id, ...updates}` | `{code, msg, data: role}` | — |
| `/roles/delete` | POST | 是 | body: `{_id}` | `{code, msg, data:{}}` | — |
| `/roles/updata/permission` | POST | 是 | body: `{_id, permissionList}` | `{code, msg, data:{}}` | 路径 `updata` 拼写错误，保留不修 |

---

## 6. 订单 & 司机 & 城市（router/orderList.cjs → `/order`）

| 路径 | 方法 | Token | 请求参数 | 返回结构 | 已知问题 |
|------|------|-------|----------|----------|----------|
| `/order/list` | GET | 是 | query: `{orderId, userName, state}` | `{code, data:{list, page:{pageNum,pageSize,total}}, msg}` | — |
| `/order/detail/:orderId` | GET | 是 | params: orderId | `{code, msg, data: order}` | — |
| `/order/create` | POST | 是 | body: 订单对象 | `{code, msg, data: order}` | — |
| `/order/edit` | POST | 是 | body: `{orderId, route}` | `{code, msg, data}` | — |
| `/order/delete` | POST | 是 | body: `{id}` | `{msg, code, data:{}}` | **字段顺序 msg 在 code 前，保留不修** |
| `/order/export` | POST | **否** | body: 筛选参数 | Excel 二进制流（Content-Type: xlsx） | 跳过鉴权，保留不修 |
| `/order/citylist` | GET | 是 | 无 | `{code, data, msg}` | — |
| `/order/vehiclelist` | GET | 是 | 无 | `{code, data}` | **缺少 `msg` 字段，保留不修** |
| `/order/cityData/:cityId` | GET | 是 | params: cityId | `{code, data: points}` | 无 `msg` 字段，保留不修 |
| `/order/driver/list` | GET | 是 | query: `{driverName, accountStatus}` | `{code, data:{list}, msg}` | — |

---

## 7. Dashboard（router/getData.cjs → `/order`）

| 路径 | 方法 | Token | 请求参数 | 返回结构 | 已知问题 |
|------|------|-------|----------|----------|----------|
| `/order/dashboard/getReportData` | GET | 是 | 无 | `{code, msg, data}` | 写死 `_id` 查询，保留不修 |
| `/order/dashboard/getLineData` | GET | 是 | 无 | `{code, msg, data}` | 同上 |
| `/order/dashboard/getPieCityData` | GET | 是 | 无 | `{code, msg, data}` | — |
| `/order/dashboard/getPieAgeData` | GET | 是 | 无 | `{code, msg, data}` | — |
| `/order/dashboard/getRadarData` | GET | 是 | 无 | `{code, msg, data}` | 写死 `_id` 查询，保留不修 |

---

## 重构期间的契约规则

1. 以上表格中标注"保留不修"的已知问题，在后续重构步骤中**必须原样保留**，除非该步骤的任务描述明确要求修复
2. 重构前后对比验收时，**只比较字段名和嵌套结构**，不比较具体数据值
3. HTTP 状态码保持原样（成功和业务错误均为 200，服务器错误为 500）
4. token 传递方式保持原样：`Authorization` 头，裸 token，无 `Bearer` 前缀

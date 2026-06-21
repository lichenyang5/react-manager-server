# 重构纪律

> 每一步重构必须遵守以下规则，违反任何一条必须停止并回退。

---

## 范围控制

1. **每次只改一个模块**——不得跨模块修改
2. **不改接口路径**——前端调用地址不变
3. **不改请求参数**——不改 query / body / params 字段名和类型
4. **不改返回结构**——不改字段名、嵌套层级、code 值
5. **不改 MongoDB 字段**——不改 collection 名、不改文档字段
6. **不改前端**——前端代码不在本次重构范围
7. **不改鉴权逻辑**——除非该步骤专门处理鉴权
8. **已知历史问题保留不修**——见 `docs/API_CONTRACT_CHECKLIST.md` 中标注的"保留不修"项

## 每次提交前必须执行

```bash
# 1. 确认改动范围
git status
git diff --stat

# 2. 确认服务能启动
npm start
# 等待 "服务器启动了" + "数据库连接成功" 输出后 Ctrl+C

# 3. 重新启动并执行契约验收
npm start &
sleep 2
bash scripts/check-api-contract.sh
kill %1

# 4. 确认改动未超出当前步骤范围后提交
git add <files>
git commit -m "<message>"
```

## 超出范围时

如果改动范围超出当前步骤的任务描述，必须：

1. 停止修改
2. `git checkout -- <超出范围的文件>`
3. 重新评估是否需要拆分为多步

## 提交规范

- 格式：`refactor: <动作> <模块>` 或 `docs: <动作>`
- 每步一个 commit，不合并多步
- commit message 中简要说明改了什么、没改什么

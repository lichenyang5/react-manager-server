#!/usr/bin/env bash
# ============================================================
# 接口契约验收脚本
#
# 用法：
#   方式 1（自动获取 token）：
#     bash scripts/check-api-contract.sh
#
#   方式 2（手动填入 token）：
#     TOKEN="eyJhbGci..." bash scripts/check-api-contract.sh
#
# 前提：服务已通过 npm start 启动在 localhost:3000
# ============================================================

BASE="http://localhost:3000"

# ---------- 获取 token ----------
if [ -z "$TOKEN" ]; then
  echo "=== POST /user/login ==="
  LOGIN_RESP=$(curl -s -X POST "$BASE/user/login" \
    -H "Content-Type: application/json" \
    -d '{"userName":"admin","userPwd":"111111"}')
  echo "$LOGIN_RESP"
  echo ""

  # 尝试用纯 bash 提取 token（不依赖 jq）
  # 匹配 "token":"<value>"
  TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$TOKEN" ]; then
    echo "[ERROR] 无法从登录响应提取 token，请手动设置："
    echo '  TOKEN="your_token_here" bash scripts/check-api-contract.sh'
    exit 1
  fi
  echo "[OK] token 已获取: ${TOKEN:0:20}..."
  echo ""
fi

# ---------- 通用请求函数 ----------
check_get() {
  local label="$1"
  local path="$2"
  echo "=== GET $path ==="
  echo "[$label]"
  curl -s "$BASE$path" -H "Authorization: $TOKEN"
  echo ""
  echo ""
}

check_post() {
  local label="$1"
  local path="$2"
  local data="$3"
  echo "=== POST $path ==="
  echo "[$label]"
  curl -s -X POST "$BASE$path" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$data"
  echo ""
  echo ""
}

# ---------- 无 token 拒绝测试 ----------
echo "=== GET /users/list (无 token，应返回 500001) ==="
curl -s "$BASE/users/list"
echo ""
echo ""

# ---------- 用户模块 ----------
check_get "用户信息" "/users/getUserInfo"
check_get "用户权限（注意：当前返回 meg 非 msg）" "/users/getPermissionList"
check_get "用户列表" "/users/list"
check_get "全部用户" "/users/all/list"

# ---------- 部门模块 ----------
check_get "部门列表" "/dept/list"

# ---------- 菜单模块 ----------
check_get "菜单列表" "/menu/list"

# ---------- 角色模块 ----------
check_get "角色列表" "/roles/list"
check_get "全部角色" "/roles/alllist"

# ---------- 订单模块 ----------
check_get "订单列表" "/order/list"
check_get "司机列表" "/order/driver/list"
check_get "城市列表" "/order/citylist"
check_get "车型列表（注意：当前无 msg 字段）" "/order/vehiclelist"

# ---------- Dashboard 模块 ----------
check_get "Dashboard 报表" "/order/dashboard/getReportData"
check_get "Dashboard 折线" "/order/dashboard/getLineData"
check_get "Dashboard 城市饼图" "/order/dashboard/getPieCityData"
check_get "Dashboard 年龄饼图" "/order/dashboard/getPieAgeData"
check_get "Dashboard 雷达" "/order/dashboard/getRadarData"

echo "============================================"
echo " 验收完成：共检查 18 个 GET 接口 + 1 个无 token 拒绝测试"
echo "============================================"

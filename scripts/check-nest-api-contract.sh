#!/usr/bin/env bash
# ============================================================
# NestJS 全量接口契约验收脚本
#
# 用法：
#   方式 1（默认 localhost:3001）：
#     bash scripts/check-nest-api-contract.sh
#
#   方式 2（自定义地址）：
#     BASE="http://localhost:3001" bash scripts/check-nest-api-contract.sh
#
#   方式 3（手动填入 token）：
#     TOKEN="eyJhbGci..." bash scripts/check-nest-api-contract.sh
#
# 前提：NestJS 服务已启动在 localhost:3001
# ============================================================

BASE="${BASE:-http://localhost:3001}"
PASS=0
FAIL=0
TOTAL=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

check_code() {
  local label="$1"
  local resp="$2"
  local expected="$3"
  TOTAL=$((TOTAL + 1))
  local code
  code=$(echo "$resp" | grep -o '"code":[0-9]*' | head -1 | cut -d: -f2)
  if [ "$code" = "$expected" ]; then
    green "  [PASS] $label (code=$code)"
    PASS=$((PASS + 1))
  else
    red "  [FAIL] $label (expected code=$expected, got code=$code)"
    FAIL=$((FAIL + 1))
  fi
}

check_nonempty() {
  local label="$1"
  local resp="$2"
  TOTAL=$((TOTAL + 1))
  if [ -n "$resp" ] && [ "$resp" != "{}" ] && [ "$resp" != "null" ]; then
    green "  [PASS] $label (non-empty response)"
    PASS=$((PASS + 1))
  else
    red "  [FAIL] $label (empty response)"
    FAIL=$((FAIL + 1))
  fi
}

# ============================================================
echo "============================================"
echo " NestJS 全量接口契约验收"
echo " BASE: $BASE"
echo "============================================"
echo ""

# ---------- 1. Health ----------
echo "=== 基础健康检查 ==="

RESP=$(curl -s "$BASE/health")
check_code "GET /health" "$RESP" "0"

RESP=$(curl -s "$BASE/health/db")
check_code "GET /health/db" "$RESP" "0"

echo ""

# ---------- 2. Login ----------
echo "=== POST /user/login ==="

if [ -z "$TOKEN" ]; then
  LOGIN_RESP=$(curl -s -X POST "$BASE/user/login" \
    -H "Content-Type: application/json" \
    -d '{"userName":"admin","userPwd":"111111"}')

  TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$TOKEN" ]; then
    red "[ERROR] 无法从登录响应提取 token，请手动设置："
    echo "  TOKEN=\"your_token\" bash scripts/check-nest-api-contract.sh"
    echo ""
    echo "登录响应: $LOGIN_RESP"
    exit 1
  fi
  check_code "POST /user/login" "$LOGIN_RESP" "0"
else
  echo "  (使用外部传入 TOKEN)"
  TOTAL=$((TOTAL + 1)); PASS=$((PASS + 1))
fi

echo "  TOKEN: ${TOKEN:0:20}..."
echo ""

AUTH_HEADER="Authorization: $TOKEN"

# ---------- 3. Users ----------
echo "=== 用户模块 ==="

RESP=$(curl -s "$BASE/users/getUserInfo" -H "$AUTH_HEADER")
check_code "GET /users/getUserInfo" "$RESP" "0"

RESP=$(curl -s "$BASE/users/list" -H "$AUTH_HEADER")
check_code "GET /users/list" "$RESP" "0"

RESP=$(curl -s "$BASE/users/all/list" -H "$AUTH_HEADER")
check_code "GET /users/all/list" "$RESP" "0"

RESP=$(curl -s "$BASE/users/getPermissionList" -H "$AUTH_HEADER")
TOTAL=$((TOTAL + 1))
# 历史契约：此接口返回 meg 不是 msg
HAS_MEG=$(echo "$RESP" | grep -o '"meg"')
HAS_CODE=$(echo "$RESP" | grep -o '"code":0')
if [ -n "$HAS_MEG" ] && [ -n "$HAS_CODE" ]; then
  green "  [PASS] GET /users/getPermissionList (code=0, meg field present)"
  PASS=$((PASS + 1))
else
  red "  [FAIL] GET /users/getPermissionList (expected meg field + code=0)"
  FAIL=$((FAIL + 1))
fi

echo ""

# ---------- 4. Dept ----------
echo "=== 部门模块 ==="

RESP=$(curl -s "$BASE/dept/list" -H "$AUTH_HEADER")
check_code "GET /dept/list" "$RESP" "0"

echo ""

# ---------- 5. Menu ----------
echo "=== 菜单模块 ==="

RESP=$(curl -s "$BASE/menu/list" -H "$AUTH_HEADER")
check_code "GET /menu/list" "$RESP" "0"

echo ""

# ---------- 6. Roles ----------
echo "=== 角色模块 ==="

RESP=$(curl -s "$BASE/roles/list" -H "$AUTH_HEADER")
check_code "GET /roles/list" "$RESP" "0"

RESP=$(curl -s "$BASE/roles/alllist" -H "$AUTH_HEADER")
check_code "GET /roles/alllist" "$RESP" "0"

echo ""

# ---------- 7. Order 基础查询 ----------
echo "=== 订单查询模块 ==="

RESP=$(curl -s "$BASE/order/list" -H "$AUTH_HEADER")
check_code "GET /order/list" "$RESP" "0"

RESP=$(curl -s "$BASE/order/citylist" -H "$AUTH_HEADER")
check_code "GET /order/citylist" "$RESP" "0"

RESP=$(curl -s "$BASE/order/vehiclelist" -H "$AUTH_HEADER")
TOTAL=$((TOTAL + 1))
# 历史契约：vehiclelist 没有 msg 字段
HAS_CODE=$(echo "$RESP" | grep -o '"code":0')
NO_MSG=$(echo "$RESP" | grep -o '"msg"')
if [ -n "$HAS_CODE" ] && [ -z "$NO_MSG" ]; then
  green "  [PASS] GET /order/vehiclelist (code=0, no msg field)"
  PASS=$((PASS + 1))
else
  red "  [FAIL] GET /order/vehiclelist (expected code=0 without msg)"
  FAIL=$((FAIL + 1))
fi

RESP=$(curl -s "$BASE/order/driver/list" -H "$AUTH_HEADER")
check_code "GET /order/driver/list" "$RESP" "0"

echo ""

# ---------- 8. Dashboard ----------
echo "=== Dashboard 模块 ==="

RESP=$(curl -s "$BASE/order/dashboard/getReportData" -H "$AUTH_HEADER")
check_code "GET /order/dashboard/getReportData" "$RESP" "0"

RESP=$(curl -s "$BASE/order/dashboard/getLineData" -H "$AUTH_HEADER")
check_code "GET /order/dashboard/getLineData" "$RESP" "0"

RESP=$(curl -s "$BASE/order/dashboard/getPieCityData" -H "$AUTH_HEADER")
check_code "GET /order/dashboard/getPieCityData" "$RESP" "0"

RESP=$(curl -s "$BASE/order/dashboard/getPieAgeData" -H "$AUTH_HEADER")
check_code "GET /order/dashboard/getPieAgeData" "$RESP" "0"

RESP=$(curl -s "$BASE/order/dashboard/getRadarData" -H "$AUTH_HEADER")
check_code "GET /order/dashboard/getRadarData" "$RESP" "0"

echo ""

# ---------- 9. Order detail ----------
echo "=== 订单详情模块 ==="

# 从 /order/list 取真实 orderId
ORDER_ID=$(curl -s "$BASE/order/list" -H "$AUTH_HEADER" | grep -o '"orderId":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$ORDER_ID" ]; then
  RESP=$(curl -s "$BASE/order/detail/$ORDER_ID" -H "$AUTH_HEADER")
  check_code "GET /order/detail/$ORDER_ID" "$RESP" "0"
else
  yellow "  [SKIP] GET /order/detail/:orderId (no order found in list)"
  TOTAL=$((TOTAL + 1)); FAIL=$((FAIL + 1))
fi

# cityData 使用已知 cityId
RESP=$(curl -s "$BASE/order/cityData/10001" -H "$AUTH_HEADER")
check_code "GET /order/cityData/10001" "$RESP" "0"

echo ""

# ---------- 10. Upload ----------
echo "=== 上传接口 ==="

# 生成临时测试图片（1x1 PNG）
UPLOAD_FILE="/tmp/nest_contract_test.png"
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > "$UPLOAD_FILE" 2>/dev/null

RESP=$(curl -s -X POST "$BASE/users/upload" \
  -H "$AUTH_HEADER" \
  -F "file=@$UPLOAD_FILE")
TOTAL=$((TOTAL + 1))
UPLOAD_CODE=$(echo "$RESP" | grep -o '"code":0')
UPLOAD_URL=$(echo "$RESP" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
if [ -n "$UPLOAD_CODE" ] && [ -n "$UPLOAD_URL" ]; then
  green "  [PASS] POST /users/upload (code=0, url=$UPLOAD_URL)"
  PASS=$((PASS + 1))
else
  red "  [FAIL] POST /users/upload (response: $RESP)"
  FAIL=$((FAIL + 1))
fi

# 清理上传的测试文件
rm -f "$UPLOAD_FILE"
if [ -n "$UPLOAD_URL" ]; then
  UPLOADED_FILENAME=$(basename "$UPLOAD_URL")
  rm -f "nest-server/public/images/$UPLOADED_FILENAME" 2>/dev/null
fi

echo ""

# ---------- 11. Export ----------
echo "=== 订单导出 ==="

EXPORT_FILE="/tmp/nest-order-export.xlsx"
rm -f "$EXPORT_FILE"
curl -s -X POST "$BASE/order/export" -o "$EXPORT_FILE"

TOTAL=$((TOTAL + 1))
if [ -f "$EXPORT_FILE" ] && [ -s "$EXPORT_FILE" ]; then
  FILESIZE=$(ls -l "$EXPORT_FILE" | awk '{print $5}')
  green "  [PASS] POST /order/export (file size: ${FILESIZE} bytes)"
  PASS=$((PASS + 1))
else
  red "  [FAIL] POST /order/export (file not found or empty)"
  FAIL=$((FAIL + 1))
fi

echo ""

# ---------- 12. No-token test ----------
echo "=== 无 Token 验证 ==="

RESP=$(curl -s "$BASE/users/getUserInfo")
check_code "GET /users/getUserInfo (no token)" "$RESP" "500001"

RESP=$(curl -s -X POST "$BASE/order/create" -H "Content-Type: application/json" -d '{}')
check_code "POST /order/create (no token)" "$RESP" "500001"

echo ""

# ============================================================
echo "============================================"
echo " 验收结果: $PASS passed / $FAIL failed / $TOTAL total"
echo "============================================"
echo ""

# ---------- 写操作手动验收说明 ----------
echo "--- 写操作接口（需手动验收或单独脚本） ---"
echo ""
echo "以下接口已迁移，但本脚本不自动执行写操作以避免污染数据："
echo ""
echo "  用户写操作："
echo "    POST /users/create"
echo "    POST /users/edit"
echo "    POST /users/delete"
echo ""
echo "  部门写操作："
echo "    POST /dept/create"
echo "    POST /dept/edit"
echo "    POST /dept/delete"
echo ""
echo "  菜单写操作："
echo "    POST /menu/create"
echo "    POST /menu/edit"
echo "    POST /menu/delete"
echo ""
echo "  角色写操作："
echo "    POST /roles/create"
echo "    POST /roles/edit"
echo "    POST /roles/delete"
echo "    POST /roles/updata/permission  (注意: updata 拼写保持历史契约)"
echo ""
echo "  订单写操作："
echo "    POST /order/create"
echo "    POST /order/edit"
echo "    POST /order/delete"
echo ""
echo "手动验收建议："
echo "  1. create 一条测试数据"
echo "  2. edit 刚创建的数据"
echo "  3. delete 刚创建的数据"
echo "  4. 确认 list 中已无测试数据"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0

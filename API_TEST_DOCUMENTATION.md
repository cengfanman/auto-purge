# AutoPurge License Service API Testing Documentation

## 服务器信息
- **Base URL**: `https://api.autopurge.shop`
- **Environment**: Production
- **Admin API Key**: `admin_2024_secure_key_789xyz`

## API接口列表

### 1. 健康检查

#### GET /health
检查服务器状态

```bash
curl -X GET "https://api.autopurge.shop/health" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "status": "ok",
  "timestamp": "2024-09-13T14:30:00.000Z"
}
```

---

### 2. 许可证管理 (License Management)

#### POST /licenses/activate
激活许可证

```bash
curl -X POST "https://api.autopurge.shop/licenses/activate" \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "your-license-key-here",
    "deviceFingerprint": "unique-device-fingerprint",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "ip": "192.168.1.100"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "maxDevices": 3,
    "currentDevices": 1
  }
}
```

#### POST /licenses/deactivate
注销许可证

```bash
curl -X POST "https://api.autopurge.shop/licenses/deactivate" \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "your-license-key-here",
    "deviceId": "unique-device-fingerprint"
  }'
```

#### POST /licenses/verify
验证JWT令牌

```bash
curl -X POST "https://api.autopurge.shop/licenses/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "jwt-token-to-verify"
  }'
```

#### GET /licenses/manage
获取许可证管理信息

```bash
curl -X GET "https://api.autopurge.shop/licenses/manage?licenseKey=your-license-key-here" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "license": {
      "code": "your-license-key-here",
      "plan": "premium",
      "email": "user@example.com",
      "maxDevices": 3,
      "status": "active",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "devices": [],
    "stats": {
      "activeDevices": 0,
      "totalActivations": 0,
      "availableSlots": 3
    }
  }
}
```

---

### 3. 支付和结账 (Payments & Checkout)

#### POST /checkout/create
创建结账链接

```bash
curl -X POST "https://api.autopurge.shop/checkout/create" \
  -H "Content-Type: application/json" \
  -d '{
    "productCode": "autopurge_pro_001",
    "email": "customer@example.com"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "hosted_url": "https://commerce.coinbase.com/checkout/...",
    "charge_id": "coinbase-charge-id"
  }
}
```

---

### 4. Webhook处理

#### POST /webhooks/coinbase
处理Coinbase Commerce webhooks（仅供Coinbase调用）

```bash
curl -X POST "https://api.autopurge.shop/webhooks/coinbase" \
  -H "Content-Type: application/json" \
  -H "X-CC-Webhook-Signature: coinbase-signature" \
  -d '{
    "event": {
      "id": "event-id",
      "type": "charge:confirmed",
      "data": {
        "id": "charge-id",
        "code": "charge-code"
      }
    }
  }'
```

#### POST /webhooks/resend
处理Resend邮件服务webhooks（仅供Resend调用）

```bash
curl -X POST "https://api.autopurge.shop/webhooks/resend" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.delivered",
    "data": {
      "id": "message-id",
      "email": "recipient@example.com",
      "delivered_at": "2024-09-13T14:30:00.000Z"
    }
  }'
```

---

### 5. JWKS (JSON Web Key Set)

#### GET /.well-known/jwks.json
获取JWT验证用的公钥集合

```bash
curl -X GET "https://api.autopurge.shop/.well-known/jwks.json" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "keys": [
    {
      "kty": "OKP",
      "crv": "Ed25519",
      "x": "base64-encoded-public-key",
      "kid": "key-id",
      "use": "sig",
      "alg": "EdDSA"
    }
  ]
}
```

---

### 6. 管理员接口 (Admin APIs)

**注意**: 所有管理员接口都需要在请求头中包含 `X-API-Key: admin_2024_secure_key_789xyz`

#### GET /admin/licenses
获取许可证列表

```bash
curl -X GET "https://api.autopurge.shop/admin/licenses?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin_2024_secure_key_789xyz"
```

**查询参数**:
- `email` (可选): 按邮箱过滤
- `status` (可选): 按状态过滤
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认50

#### POST /admin/licenses/revoke
撤销许可证

```bash
curl -X POST "https://api.autopurge.shop/admin/licenses/revoke" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin_2024_secure_key_789xyz" \
  -d '{
    "licenseKey": "license-key-to-revoke",
    "reason": "Violation of terms of service"
  }'
```

#### POST /admin/licenses/resend
重新发送许可证邮件

```bash
curl -X POST "https://api.autopurge.shop/admin/licenses/resend" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin_2024_secure_key_789xyz" \
  -d '{
    "licenseKey": "license-key-here"
  }'
```

#### GET /admin/payments
获取支付记录

```bash
curl -X GET "https://api.autopurge.shop/admin/payments?status=completed&page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin_2024_secure_key_789xyz"
```

#### GET /admin/activations
获取许可证激活记录

```bash
curl -X GET "https://api.autopurge.shop/admin/activations?licenseKey=your-license-key" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin_2024_secure_key_789xyz"
```

#### GET /admin/email-events
获取邮件事件记录

```bash
curl -X GET "https://api.autopurge.shop/admin/email-events?recipient=user@example.com&page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin_2024_secure_key_789xyz"
```

---

## 测试流程建议

### 1. 基础连接测试
```bash
# 测试服务器是否正常运行
curl -X GET "https://api.autopurge.shop/health"
```

### 2. JWKS测试
```bash
# 获取公钥信息
curl -X GET "https://api.autopurge.shop/.well-known/jwks.json"
```

### 3. 许可证测试流程
```bash
# 1. 创建结账（获取支付链接）
curl -X POST "https://api.autopurge.shop/checkout/create" \
  -H "Content-Type: application/json" \
  -d '{"productCode": "autopurge_pro_001", "email": "test@example.com"}'

# 2. 激活许可证（需要有效的许可证密钥）
curl -X POST "https://api.autopurge.shop/licenses/activate" \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "your-license-key",
    "deviceFingerprint": "test-device-123",
    "userAgent": "Test Agent",
    "ip": "127.0.0.1"
  }'

# 3. 验证JWT令牌
curl -X POST "https://api.autopurge.shop/licenses/verify" \
  -H "Content-Type: application/json" \
  -d '{"token": "jwt-from-activation"}'

# 4. 获取许可证管理信息
curl -X GET "https://api.autopurge.shop/licenses/manage?licenseKey=your-license-key"

# 5. 注销设备
curl -X POST "https://api.autopurge.shop/licenses/deactivate" \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "your-license-key",
    "deviceId": "test-device-123"
  }'
```

### 4. 管理员功能测试
```bash
# 获取许可证列表
curl -X GET "https://api.autopurge.shop/admin/licenses?page=1&limit=5" \
  -H "X-API-Key: admin_2024_secure_key_789xyz"

# 获取支付记录
curl -X GET "https://api.autopurge.shop/admin/payments?page=1&limit=5" \
  -H "X-API-Key: admin_2024_secure_key_789xyz"
```

## 启动服务器

在测试前，请确保服务器正在运行：

```bash
# 进入项目目录
cd /Users/yingxuegu/Documents/project/uu-backend-nodejs

# 安装依赖（如果还没有安装）
npm install

# 生成Prisma客户端
npm run prisma:generate

# 运行开发服务器
npm run dev

# 或者构建并运行生产版本
npm run build
npm start
```

## 常见错误处理

### 1. 400 Bad Request
- 检查请求体格式是否正确
- 确保必需字段都已提供

### 2. 401 Unauthorized
- 检查管理员API密钥是否正确
- 验证JWT令牌是否有效

### 3. 404 Not Found
- 确认API路径正确
- 检查许可证密钥是否存在

### 4. 500 Internal Server Error
- 检查服务器日志
- 确认数据库连接正常
- 验证环境变量配置

## 注意事项

1. **环境变量**: 确保所有必需的环境变量都已正确配置
2. **数据库**: 确保数据库连接正常且表结构已创建
3. **API密钥**: 保护好管理员API密钥，不要在生产环境中暴露
4. **许可证密钥**: 用于测试的许可证密钥需要在数据库中存在
5. **Webhook**: Webhook端点主要由外部服务调用，测试时需要模拟正确的签名

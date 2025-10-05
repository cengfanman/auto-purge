# AutoPurge 最终发布检查清单

**发布日期**: 2025年10月4日
**版本**: 1.0.0

---

## ⚠️ 发布前必做事项

### 1. 清理调试代码 🔧

#### a) 移除所有 storage 监控日志
**需要修改的文件：**
- [ ] `extension/options.js` - 删除 line 6-23 的 storage wrapper
- [ ] `extension/popup.js` - 删除 line 6-23 的 storage wrapper
- [ ] `extension/background.js` - 删除 line 17-34 的 storage wrapper
- [ ] `extension/license-manager.js` - 删除 line 6-23 的 storage wrapper

**操作：** 删除所有以 `// 🐛 DEBUG:` 开头的代码块

#### b) 切换到生产环境产品代码
**文件：** `extension/options.js`

**修改：** Line ~3220
```javascript
// 当前（测试）：
function getSelectedProductCode() {
  return selectedBillingCycle === 'monthly' ? 'autopurge_pro_monthly_test' : 'autopurge_pro_yearly_test';
}

// 改为（正式）：
function getSelectedProductCode() {
  return selectedBillingCycle === 'monthly' ? 'autopurge_pro_monthly' : 'autopurge_pro_yearly';
}
```

- [ ] 修改完成并测试

#### c) 切换 API 地址（已经是正式的）
**文件：** `extension/license-manager.js` line 8
```javascript
this.apiBaseUrl = 'https://api.autopurge.shop'; // ✅ 已经是正式环境
```

#### d) 减少 console.log 输出（可选）
- [ ] 考虑移除或注释掉非关键的 console.log
- [ ] 保留错误日志（console.error, console.warn）

---

### 2. 代码质量检查 ✅

```bash
cd /Users/yingxuegu/Documents/project/auto-purge

# 运行 lint 检查
npm run lint

# 如果有错误，自动修复
npm run lint:fix
```

- [ ] Lint 检查通过
- [ ] 没有严重错误

---

### 3. 功能测试 🧪

#### 基础功能
- [ ] Extension 安装正常
- [ ] Popup 显示正常
- [ ] Options 页面打开正常
- [ ] 域名管理功能正常

#### 订阅功能
- [ ] Monthly/Yearly 切换正常
- [ ] Coinbase 支付流程正常
- [ ] License 激活功能正常
- [ ] License 验证功能正常

#### 统计功能
- [ ] TODAY 统计显示正常
- [ ] TOTAL 统计显示正常
- [ ] 每日重置功能正常

#### Pro 功能
- [ ] History Records 功能正常
- [ ] Security 功能正常
- [ ] License 管理功能正常

---

### 4. 打包扩展 📦

```bash
cd /Users/yingxuegu/Documents/project/auto-purge

# 清理旧的打包文件
npm run clean

# 打包（包含 lint 检查）
npm run build
```

这会生成：`dist/autopurge.zip`

- [ ] 打包成功
- [ ] ZIP 文件大小合理（< 1MB）
- [ ] 解压后文件结构正确

---

### 5. 本地测试打包文件 🔍

1. **打开 Chrome Extensions 页面**
   ```
   chrome://extensions/
   ```

2. **移除当前开发版本**
   - 找到 AutoPurge
   - 点击 "移除"

3. **加载打包版本**
   - 解压 `dist/autopurge.zip` 到临时文件夹
   - 点击 "加载已解压的扩展程序"
   - 选择解压后的文件夹

4. **完整测试**
   - [ ] 所有功能正常工作
   - [ ] 没有控制台错误
   - [ ] License 激活流程正常
   - [ ] 支付流程正常

---

### 6. 准备发布材料 📄

#### a) 扩展截图
需要准备：
- [ ] 1280x800 截图 x 3-5张
  - Popup 界面
  - Options 页面（Domain Management）
  - Subscription 页面
  - History Records 页面
  - 使用示例

#### b) 扩展图标
- [ ] 16x16 icon.png
- [ ] 48x48 icon.png
- [ ] 128x128 icon.png
- [ ] 确认图标清晰美观

#### c) Store Listing 信息
参考 `CHROME_STORE_LISTING.md`

**必需信息：**
- [ ] 扩展名称: AutoPurge - Privacy Protection
- [ ] 简短描述（132字符以内）
- [ ] 详细描述
- [ ] 类别: Productivity
- [ ] 语言: English

#### d) 隐私政策
- [ ] 隐私政策 URL: https://autopurge.shop/privacy（或你的网站）
- [ ] 确保隐私政策内容完整且合规

#### e) 支持信息
- [ ] Support email: ilovexuu2024@gmail.com
- [ ] Telegram: https://t.me/autopurge_support
- [ ] Discord: https://discord.gg/jsh8xK8Wzq

---

### 7. Chrome Web Store 发布 🚀

#### Step 1: 开发者账户
1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. 使用 Google 账户登录
3. 支付 $5 开发者注册费（一次性）
4. 完成账户验证

- [ ] 开发者账户已创建

#### Step 2: 上传扩展
1. 点击 "New Item"
2. 上传 `dist/autopurge.zip`
3. 等待上传完成

- [ ] 扩展上传成功

#### Step 3: 填写 Store Listing
按照准备好的材料填写：
- [ ] 产品详情
- [ ] 图标和截图
- [ ] 隐私政策
- [ ] 支持联系方式

#### Step 4: 提交审核
1. 检查所有必填项
2. 预览 Store Listing
3. 点击 "Submit for Review"
4. 等待审核（通常 1-3 个工作日）

- [ ] 已提交审核
- [ ] 记录提交时间：__________

---

## 📋 发布命令汇总

```bash
# 1. 进入项目目录
cd /Users/yingxuegu/Documents/project/auto-purge

# 2. 清理旧文件
npm run clean

# 3. 代码质量检查和打包
npm run build

# 4. 验证打包文件
ls -lh dist/autopurge.zip

# 5. 解压测试（可选）
unzip -l dist/autopurge.zip | head -20
```

---

## ⚠️ 重要提醒

### 发布前必须做的修改

1. **✅ 移除调试代码** - 删除所有 `🐛 DEBUG` 相关代码
2. **✅ 切换产品代码** - 从 test 切换到正式产品
3. **✅ 测试打包版本** - 完整测试所有功能
4. **✅ 准备发布材料** - 截图、描述、隐私政策

### 发布后维护

- 监控用户安装量和评分
- 及时响应用户反馈
- 修复发现的 bugs
- 计划后续版本更新

---

## 🎯 版本信息

**当前版本**: 1.0.0
**Manifest Version**: 3
**Chrome 最低版本**: 88+

---

## 📞 发布支持

如遇到问题，参考：
- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- 项目文档：`TESTING_AND_PUBLISHING.md`

---

**祝发布顺利！** 🚀

**检查清单完成时间**: __________
**发布提交时间**: __________
**审核通过时间**: __________

# AutoPurge Screenshots for Chrome Web Store

## 📸 截图要求

### Chrome Web Store 要求：
- **尺寸**: 1280x800 或 640x400 (推荐 1280x800)
- **格式**: PNG 或 JPG
- **数量**: 最少 1 张，推荐 3-5 张
- **文件大小**: 每张不超过 1MB

---

## 🎯 需要准备的截图

### 1. **popup.png** - Popup 界面
**内容展示：**
- Extension popup 弹窗
- 显示当前网站状态
- 域名监控统计
- Today/Total 删除统计

**如何截图：**
1. 访问一个被监控的网站（如 twitter.com）
2. 点击工具栏的 AutoPurge 图标
3. 等待 popup 完全加载
4. 截图整个 popup 窗口

**建议尺寸：** 居中放置，周围留白

---

### 2. **domains.png** - 域名管理
**内容展示：**
- Options 页面的 Domain Management 部分
- Preset Domains 列表
- Custom Domains 列表
- 添加域名功能

**如何截图：**
1. 右键 Extension 图标 → Options
2. 确保在 "Domain Management" 页面
3. 展示一些预设域名和自定义域名
4. 截取整个页面或主要区域

**建议尺寸：** 1280x800 完整截图

---

### 3. **subscription.png** - 订阅页面
**内容展示：**
- Subscription Plans 页面
- Monthly/Yearly 选择
- 价格对比
- Buy with Coinbase 按钮
- License 激活输入框

**如何截图：**
1. Options → Subscription
2. 确保显示完整的定价卡片
3. 可以高亮 "SAVE 14%" 等亮点
4. 截取整个定价区域

**建议尺寸：** 1280x800

---

### 4. **history-records.png** - History Records (可选)
**内容展示：**
- History Records 功能页面
- 统计信息显示
- 记录列表（如果已激活 Pro）
- 或显示 Pro feature 升级提示

**如何截图：**
1. Options → History Records
2. 如果是 Free plan，展示升级提示
3. 如果是 Pro plan，展示记录列表
4. 截取主要功能区域

**建议尺寸：** 1280x800

---

### 5. **security.png** - Security 功能 (可选)
**内容展示：**
- Security 页面
- Password Protection 功能
- PIN Lock 功能
- 安全设置界面

**如何截图：**
1. Options → Security
2. 展示安全功能设置
3. 截取主要区域

**建议尺寸：** 1280x800

---

## 🛠️ 截图工具和方法

### 方法 1：macOS 系统截图
```bash
# 截取选定区域
Cmd + Shift + 4

# 截取整个窗口
Cmd + Shift + 4 + 空格键

# 截图会自动保存到桌面
```

### 方法 2：Chrome DevTools（精确尺寸）
1. 打开要截图的页面
2. F12 打开 DevTools
3. 点击设备工具栏图标（Ctrl/Cmd + Shift + M）
4. 选择 "Responsive"
5. 设置尺寸为 1280x800
6. Cmd + Shift + P (macOS) 或 Ctrl + Shift + P (Windows)
7. 输入 "Capture screenshot"
8. 选择 "Capture full size screenshot"

### 方法 3：浏览器扩展
推荐使用：
- **Awesome Screenshot**
- **Nimbus Screenshot**
- **Fireshot**

---

## ✅ 截图检查清单

拍摄完成后，确保：
- [ ] 尺寸为 1280x800 (或 640x400)
- [ ] 格式为 PNG 或 JPG
- [ ] 文件大小 < 1MB
- [ ] 截图清晰，无模糊
- [ ] 无个人敏感信息（邮箱、license key等）
- [ ] 展示了关键功能
- [ ] 界面完整，无截断

---

## 📁 文件命名建议

```
screenshots/
├── 01-popup.png              # Popup 界面
├── 02-domain-management.png  # 域名管理
├── 03-subscription.png       # 订阅页面
├── 04-history-records.png    # 历史记录（可选）
├── 05-security.png            # 安全功能（可选）
└── README.md                  # 本文件
```

---

## 🎨 截图优化建议

### 展示最佳效果：
1. **使用真实数据** - 不要空白页面
2. **保持整洁** - 关闭不必要的浏览器标签
3. **高亮重点** - 确保关键功能清晰可见
4. **统一风格** - 所有截图使用相同浏览器和主题

### 避免的内容：
- 个人敏感信息
- 测试数据（如 test@test.com）
- 调试信息
- 浏览器开发工具界面

---

## 📤 上传到 Chrome Web Store

### 上传时间：
在 Chrome Web Store Developer Dashboard 提交扩展时

### 上传位置：
Store Listing → Screenshots 部分

### 上传顺序：
按照功能重要性排序：
1. Popup (最重要)
2. Domain Management
3. Subscription
4. 其他功能

---

## 💡 提示

- **最少准备 3 张**：popup, domains, subscription
- **推荐准备 5 张**：包含所有主要功能
- **可以后续更新**：发布后仍可更换截图

---

**创建日期**: 2025年10月4日
**目的**: Chrome Web Store 扩展发布

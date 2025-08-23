# Chrome Web Store 发布指南

## 扩展包已构建完成 ✅

扩展包 `autopurge.zip` 已成功构建在 `dist/` 目录中，大小约19KB。

## 发布到Chrome Web Store的步骤

### 1. 准备开发者账户

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. 使用Google账户登录
3. 支付一次性开发者注册费（$5.00 USD）
4. 完成开发者账户设置

### 2. 创建新项目

1. 在开发者控制台中点击 "Add new item"
2. 选择 "Chrome Extension"
3. 上传 `dist/autopurge.zip` 文件

### 3. 填写扩展信息

#### 基本信息
- **扩展名称**: AutoPurge - History Cleaner
- **简短描述**: Automatically purge browsing history for specified domains
- **详细描述**: 
```
AutoPurge is a privacy-focused Chrome extension that automatically removes browsing history for specified domains after you leave the page. Perfect for maintaining privacy while browsing sensitive content.

🔒 Privacy First: No data uploaded to servers, all processing local
🔄 Automatic History Deletion: Removes URLs from Chrome history after leaving the page
🎯 Smart Domain Matching: Works with both exact domains and subdomains
⏱️ Configurable Delay: Set deletion delay (3, 10, or 30 seconds)
📋 Preset Domain Library: Built-in list of adult content domains
✏️ Custom Domains: Add up to 10 custom domains
📊 Usage Statistics: Track deletion counts without storing URLs
🚀 Quick Cleanup: One-click deletion of recent history
```

#### 分类信息
- **类别**: Productivity
- **语言**: English
- **隐私政策**: 需要提供隐私政策URL

### 4. 上传截图和图标

#### 必需截图
- 至少1张截图，建议尺寸：1280x800 或 640x400
- 展示扩展的主要功能界面

#### 图标要求
- 128x128 PNG格式
- 透明背景
- 清晰可识别

### 5. 隐私政策

由于扩展需要访问浏览历史，必须提供隐私政策。建议包含：

```
# AutoPurge 隐私政策

## 数据收集
- 本扩展不收集、存储或传输任何个人数据
- 所有设置和配置仅存储在本地设备上
- 不向任何第三方服务器发送数据

## 权限说明
- history: 用于删除指定的浏览历史记录
- storage: 用于保存本地设置
- tabs: 用于监控标签页变化
- webNavigation: 用于检测页面导航事件

## 数据安全
- 所有数据加密存储在本地
- 不记录访问的URL内容
- 不跟踪用户行为

## 联系方式
如有隐私相关问题，请联系：[你的邮箱]
```

### 6. 提交审核

1. 确保所有必填字段已填写
2. 检查扩展功能是否正常
3. 点击 "Submit for Review"
4. 等待Google审核（通常1-3个工作日）

### 7. 审核通过后

1. 扩展将在Chrome Web Store上线
2. 用户可以通过搜索找到并安装
3. 可以监控安装量、评分和评论
4. 根据用户反馈进行更新

## 本地测试

在发布之前，建议先在本地测试：

1. 打开Chrome，访问 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `extension/` 文件夹
5. 测试所有功能是否正常

## 更新扩展

后续更新时：

1. 修改 `manifest.json` 中的版本号
2. 重新构建扩展包
3. 在开发者控制台上传新版本
4. 填写更新说明
5. 提交审核

## 注意事项

- 确保扩展符合Chrome Web Store政策
- 不要使用误导性的描述或截图
- 及时响应用户反馈和问题报告
- 定期更新以修复bug和改进功能
- 遵守隐私和数据保护法规

## 成功发布后

🎉 恭喜！你的扩展已成功发布到Chrome Web Store！

用户现在可以：
- 在Chrome Web Store搜索"AutoPurge"
- 查看扩展详情和截图
- 安装和使用扩展
- 提供评分和评论

记得定期检查用户反馈，持续改进扩展功能！


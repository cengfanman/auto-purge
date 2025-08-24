# AutoPurge 域名功能调试指南

## 问题描述

用户反馈 preset domains 没有展示出来，custom domains 功能也不工作。

## 已实施的修复

### 1. 增强的错误处理
- 改进了 `loadPresetDomains()` 函数，添加了备用域名列表
- 修复了 `showMessage()` 函数，使其能在新布局中正确显示
- 添加了详细的调试日志

### 2. 备用预设域名
如果 JSON 文件加载失败，系统会自动使用以下备用域名：
- google.com
- facebook.com
- youtube.com
- twitter.com
- instagram.com
- linkedin.com
- reddit.com
- amazon.com
- netflix.com
- spotify.com

### 3. 调试工具
在 Domain Management 页面添加了调试按钮：
- **Log Preset Domains**: 在控制台输出预设域名列表
- **Log Custom Domains**: 在控制台输出自定义域名列表
- **Reload Data**: 重新加载所有数据
- **Refresh Lists**: 刷新域名列表显示
- **Test Add Domain**: 测试添加域名功能
- **Test Remove Domain**: 测试删除域名功能

## 调试步骤

### 步骤 1: 打开开发者工具
1. 在 options 页面按 `F12` 或右键选择"检查"
2. 切换到 `Console` 标签页

### 步骤 2: 检查域名加载
1. 刷新页面
2. 查看控制台输出，应该能看到：
   ```
   Loading preset domains...
   Loaded X preset domains from JSON file
   UI updated, preset domains: [...]
   UI updated, custom domains: [...]
   ```

### 步骤 3: 使用调试按钮
1. 点击 "Log Preset Domains" 按钮
2. 点击 "Log Custom Domains" 按钮
3. 查看控制台输出

### 步骤 4: 测试功能
1. 在输入框中输入一个域名（如：example.com）
2. 点击 "Add Domain" 按钮
3. 查看是否显示成功消息
4. 检查域名是否出现在列表中

## 常见问题排查

### 问题 1: 预设域名不显示
**可能原因：**
- JSON 文件路径错误
- 文件格式问题
- JavaScript 错误

**解决方案：**
1. 检查控制台错误信息
2. 点击 "Reload Data" 按钮
3. 查看是否使用了备用域名

### 问题 2: 自定义域名无法添加
**可能原因：**
- 域名格式验证失败
- 域名已存在
- JavaScript 错误

**解决方案：**
1. 确保域名格式正确（如：example.com）
2. 检查控制台错误信息
3. 使用 "Test Add Domain" 按钮测试

### 问题 3: 消息不显示
**可能原因：**
- CSS 样式问题
- JavaScript 错误

**解决方案：**
1. 检查控制台错误信息
2. 确保页面完全加载
3. 尝试刷新页面

## 控制台调试命令

在开发者工具控制台中，你可以直接使用以下命令：

```javascript
// 查看当前配置
console.log(window.optionsDebug.config);

// 查看预设域名
console.log(window.optionsDebug.presetDomains);

// 查看自定义域名
console.log(window.optionsDebug.config.userDomains);

// 手动刷新域名列表
window.optionsDebug.updateDomainLists();

// 重新加载数据
window.optionsDebug.loadData();

// 测试添加域名
window.optionsDebug.testAddDomain();

// 测试删除域名
window.optionsDebug.testRemoveDomain();
```

## 预期行为

### 正常工作时：
1. 页面加载后，预设域名列表应该显示 10 个域名
2. 自定义域名列表初始为空，显示 "No custom domains added yet"
3. 添加域名时显示绿色成功消息
4. 删除域名时显示绿色成功消息
5. 所有操作都有相应的控制台日志

### 如果仍有问题：
1. 检查浏览器控制台是否有错误信息
2. 确认扩展权限是否正确
3. 尝试禁用其他扩展，排除冲突
4. 检查 manifest.json 中的权限设置

## 联系支持

如果按照以上步骤仍然无法解决问题，请：
1. 截图显示控制台错误信息
2. 记录具体的操作步骤
3. 提供浏览器版本和操作系统信息
4. 描述期望的行为和实际的行为差异

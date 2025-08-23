# AutoPurge 调试指南

## 🔍 当前问题
扩展返回 `undefined` 响应，需要调试背景脚本和消息传递。

## 🧪 调试步骤

### 1. 检查扩展状态
1. 打开 `chrome://extensions/`
2. 找到 AutoPurge 扩展
3. 确保它是**启用**状态
4. 点击**刷新**按钮重新加载扩展

### 2. 查看背景脚本日志
1. 在扩展页面，点击 AutoPurge 下面的**检查视图** "service worker"
2. 如果没有 "service worker" 链接，点击**重新加载**按钮
3. 在打开的开发者工具中查看 Console 标签
4. 应该看到：
   ```
   AutoPurge extension initializing...
   Loaded X preset domains
   AutoPurge extension initialized successfully
   ```

### 3. 测试消息传递
1. 在背景脚本的控制台中手动测试：
   ```javascript
   // 测试配置加载
   console.log('Config:', config);
   console.log('Preset domains:', presetDomains);
   
   // 测试域名检查
   console.log('Should purge google.com:', shouldPurgeDomain('https://www.google.com'));
   console.log('Should purge xvideos.com:', shouldPurgeDomain('https://www.xvideos.com'));
   ```

### 4. 检查popup日志
1. 右键点击扩展图标
2. 选择**检查弹出内容**
3. 在开发者工具中查看 Console 标签
4. 点击**刷新状态**按钮
5. 观察日志输出

### 5. 预期的日志输出

#### 背景脚本应该显示：
```
AutoPurge extension initializing...
Loaded 20 preset domains
AutoPurge extension initialized successfully
Background script received message: {action: "getConfig"}
Current config state: {enabled: true, delaySec: 10, ...}
Preset domains loaded: 20
Background script received message: {action: "getCurrentTabStatus"}
Getting current tab status...
Found tabs: [...]
Current tab: {...}
URL parsed successfully: {...}
```

#### Popup应该显示：
```
Loading current tab status...
Chrome runtime available: true
Chrome tabs available: true
Testing background script response...
Background script test response: {enabled: true, ...}
Received tab status: {isMatched: false, hostname: "..."}
Tab status type: object
Tab status keys: ["isMatched", "hostname", "url", "title"]
```

## ⚠️ 常见问题和解决方案

### 问题1: 没有 "service worker" 链接
**解决方案**: 
- 点击扩展的**刷新**按钮
- 或者禁用后重新启用扩展

### 问题2: 背景脚本报错
**可能原因**:
- manifest.json 语法错误
- JavaScript 语法错误
- 权限不足

**解决方案**:
- 检查 Chrome 扩展页面的**错误**部分
- 修复所有报告的错误

### 问题3: 消息传递失败
**可能原因**:
- 背景脚本未启动
- 消息处理器未正确注册
- 异步操作超时

**解决方案**:
- 重新加载扩展
- 检查 `chrome.runtime.onMessage.addListener` 是否正确设置
- 确保 `sendResponse` 被调用

### 问题4: 权限被拒绝
**可能原因**:
- Chrome 系统页面限制
- 扩展权限不足

**解决方案**:
- 访问普通网站测试（如 google.com）
- 检查 manifest.json 中的权限设置

## 🔧 紧急修复

如果所有调试都失败，可以尝试：

1. **完全重新安装扩展**:
   - 删除扩展
   - 重新加载扩展文件夹

2. **重置Chrome**:
   - 重启 Chrome 浏览器
   - 检查 Chrome 版本是否支持 Manifest V3

3. **检查文件完整性**:
   - 确保所有文件都存在
   - 检查 manifest.json 语法

## 📞 获取帮助

如果问题仍然存在，请提供以下信息：
- Chrome 版本
- 背景脚本完整日志
- Popup 完整日志
- 任何错误消息的截图

---

**记住**: 每次修改代码后都需要在扩展页面点击**刷新**按钮！

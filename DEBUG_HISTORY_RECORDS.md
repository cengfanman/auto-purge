# 历史记录功能调试指南

## 问题诊断

历史记录为空可能有以下几个原因：

### 1. 检查扩展是否启用
- 打开扩展的 popup 页面
- 确认状态显示为 "Active"
- 如果显示 "Inactive"，点击 "Enable" 按钮

### 2. 检查域名匹配
- 访问 google.com, facebook.com, youtube.com 等测试网站
- 打开浏览器开发者工具 (F12)
- 查看 Console 标签页中的日志
- 应该看到类似这样的日志：
  ```
  Checking URL for deletion: https://www.google.com hostname: www.google.com
  Checking preset domains: ["xvideos.com", "pornhub.com", ..., "google.com", ...]
  Match found in preset domains: google.com
  scheduleDelete called for: https://www.google.com
  Domain match result: true
  Scheduled deletion for: https://www.google.com (delay: 10s)
  ```

### 3. 检查历史记录设置
- 打开扩展的 Options 页面
- 点击 "History Records" 标签
- 确认 "Auto Record Deletions" 开关是开启的
- 检查最大记录数和保留天数设置

### 4. 检查删除执行
在 Console 中应该看到：
```
Executing scheduled deletion for: https://www.google.com
recordHistoryDeletion called for: https://www.google.com title: Google domain: www.google.com
History settings: {autoRecord: true, maxRecords: 1000, retentionDays: 30}
Existing history records count: 0
Created new record: {id: "...", url: "...", title: "...", domain: "...", deletedAt: ...}
Final history records count: 1
History deletion recorded successfully: https://www.google.com
```

## 测试步骤

### 步骤 1: 重新加载扩展
1. 打开 `chrome://extensions/`
2. 找到 AutoPurge 扩展
3. 点击刷新按钮重新加载扩展

### 步骤 2: 启用扩展
1. 点击扩展图标打开 popup
2. 确认状态为 "Active"
3. 如果不是，点击 "Enable" 按钮

### 步骤 3: 访问测试网站
1. 访问 https://www.google.com
2. 等待 10 秒（默认延迟时间）
3. 检查浏览器历史记录是否被删除

### 步骤 4: 检查历史记录
1. 打开扩展的 Options 页面
2. 点击 "History Records" 标签
3. 点击 "Refresh" 按钮
4. 查看是否有记录出现

### 步骤 5: 查看调试日志
1. 打开浏览器开发者工具 (F12)
2. 访问一个测试网站
3. 在 Console 中查看日志输出
4. 确认每个步骤都有相应的日志

## 常见问题解决

### 问题 1: 没有看到任何日志
- 确认扩展已重新加载
- 确认扩展已启用
- 检查 Console 中是否有错误信息

### 问题 2: 看到 "AutoPurge is disabled"
- 在 popup 中点击 "Enable" 按钮
- 或者检查 config.enabled 的值

### 问题 3: 看到 "No match found for: xxx"
- 确认访问的网站在预设域名列表中
- 或者手动添加域名到自定义域名列表

### 问题 4: 看到 "Auto recording is disabled"
- 在 Options 页面中启用 "Auto Record Deletions" 开关

### 问题 5: 历史记录仍然为空
- 检查 chrome.storage.local 中是否有 historyRecords 数据
- 在 Console 中运行：
  ```javascript
  chrome.storage.local.get(['historyRecords'], (result) => {
    console.log('History records:', result.historyRecords);
  });
  ```

## 手动测试命令

在浏览器 Console 中运行以下命令来测试功能：

```javascript
// 检查扩展配置
chrome.storage.local.get(['enabled', 'userDomains', 'historySettings'], (result) => {
  console.log('Config:', result);
});

// 检查历史记录
chrome.storage.local.get(['historyRecords'], (result) => {
  console.log('History records:', result.historyRecords);
});

// 手动添加测试记录
chrome.storage.local.set({
  historyRecords: [{
    id: 'test123',
    url: 'https://test.com',
    title: 'Test Page',
    domain: 'test.com',
    deletedAt: Date.now()
  }]
});
```

## 如果问题仍然存在

1. 完全卸载并重新安装扩展
2. 清除浏览器数据
3. 检查是否有其他扩展冲突
4. 查看是否有 JavaScript 错误阻止了功能执行

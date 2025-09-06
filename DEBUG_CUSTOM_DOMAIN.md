# 自定义域名调试指南

## 问题诊断步骤

### 1. 确认扩展状态
1. 打开扩展的 popup 页面
2. 确认状态显示为 "Active"（绿色）
3. 如果显示 "Inactive"，点击 "Enable" 按钮

### 2. 检查自定义域名是否正确添加
1. 打开扩展的 Options 页面
2. 点击 "Domain Management" 标签
3. 在 "Custom Domains" 部分查看是否有 91porny.com
4. 如果没有，点击 "Add Domain" 添加

### 3. 检查域名匹配
1. 访问 https://91porny.com
2. 打开浏览器开发者工具 (F12)
3. 查看 Console 标签页中的日志
4. 应该看到类似这样的日志：
   ```
   Checking URL for deletion: https://91porny.com hostname: 91porny.com
   Checking preset domains: [...]
   Checking user domains: ["91porny.com"]
   Match found in user domains: 91porny.com
   scheduleDelete called for: https://91porny.com
   Domain match result: true
   Scheduled deletion for: https://91porny.com (delay: 10s)
   ```

### 4. 检查历史记录设置
1. 在 Options 页面点击 "History Records" 标签
2. 确认 "Auto Record Deletions" 开关是开启的
3. 点击 "Reload Domains" 按钮重新加载域名列表

### 5. 手动测试域名匹配
在浏览器 Console 中运行以下代码来测试：

```javascript
// 检查当前配置
chrome.storage.local.get(['enabled', 'userDomains'], (result) => {
  console.log('Extension enabled:', result.enabled);
  console.log('User domains:', result.userDomains);
});

// 手动测试域名匹配
chrome.runtime.sendMessage({ action: 'getCurrentTabStatus' }, (response) => {
  console.log('Current tab status:', response);
});
```

## 常见问题解决

### 问题 1: 扩展未启用
- 在 popup 中点击 "Enable" 按钮
- 确认状态变为 "Active"

### 问题 2: 自定义域名未添加
- 在 Options 页面的 "Domain Management" 中添加 91porny.com
- 确认域名出现在 "Custom Domains" 列表中

### 问题 3: 域名匹配失败
- 检查 Console 日志中的 "Checking user domains" 部分
- 确认 91porny.com 在列表中
- 检查域名拼写是否正确

### 问题 4: 历史记录功能未启用
- 在 "History Records" 页面确认 "Auto Record Deletions" 已开启
- 检查最大记录数和保留天数设置

### 问题 5: 没有看到任何日志
- 确认扩展已重新加载
- 检查 Console 中是否有错误信息
- 尝试刷新页面后再次访问

## 快速测试命令

在浏览器 Console 中运行：

```javascript
// 1. 检查扩展状态
chrome.storage.local.get(['enabled', 'userDomains', 'historySettings'], (result) => {
  console.log('Extension status:', result);
});

// 2. 手动添加测试域名
chrome.storage.local.get(['userDomains'], (result) => {
  const domains = result.userDomains || [];
  if (!domains.includes('91porny.com')) {
    domains.push('91porny.com');
    chrome.storage.local.set({ userDomains: domains });
    console.log('Added 91porny.com to user domains');
  }
});

// 3. 检查历史记录
chrome.storage.local.get(['historyRecords'], (result) => {
  console.log('History records:', result.historyRecords);
});

// 4. 手动添加测试历史记录
chrome.storage.local.set({
  historyRecords: [{
    id: 'test123',
    url: 'https://91porny.com',
    title: 'Test Page',
    domain: '91porny.com',
    deletedAt: Date.now()
  }]
});
```

## 如果问题仍然存在

1. 完全重新加载扩展：
   - 打开 `chrome://extensions/`
   - 找到 AutoPurge 扩展
   - 点击刷新按钮

2. 清除扩展数据：
   - 在 Console 中运行：
   ```javascript
   chrome.storage.local.clear();
   ```

3. 重新设置：
   - 重新启用扩展
   - 重新添加自定义域名
   - 重新启用历史记录功能

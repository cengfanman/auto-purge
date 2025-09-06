# 91porny.com 历史记录问题调试指南

## 问题描述
访问了 91porny.com 但历史记录里没有显示，需要了解 Security 和 History Record 的区别。

## 概念解释

### Security vs History Record

1. **Security（安全状态）**
   - 指网站的安全连接状态（HTTPS/HTTP）
   - 浏览器地址栏的锁图标表示安全连接
   - 与扩展功能无关，是浏览器安全机制

2. **History Record（历史记录）**
   - 扩展内部功能，用于记录被删除的浏览历史
   - 存储在扩展的本地存储中
   - 用于追踪哪些网站的历史被自动删除

## 可能的原因分析

### 1. 扩展未启用
- 检查扩展是否在 Chrome 中启用
- 检查扩展的 `enabled` 配置是否为 `true`

### 2. 域名匹配失败
- 虽然 `91porny.com` 在预设域名列表中
- 但匹配逻辑可能有问题
- 需要检查 URL 解析和域名比较逻辑

### 3. 历史记录功能未启用
- 检查 `historySettings.autoRecord` 是否为 `true`
- 默认应该是启用的

### 4. 延迟删除机制
- 扩展有 10 秒延迟删除机制
- 可能还没到删除时间
- 需要等待延迟时间结束

### 5. 浏览器历史记录中确实没有
- 可能网站没有成功访问
- 或者浏览器没有记录该访问

## 调试步骤

### 步骤 1: 使用测试页面
1. 打开 `test-page.html` 文件
2. 点击各个测试按钮
3. 查看调试日志

### 步骤 2: 检查扩展状态
```javascript
// 在浏览器控制台中运行
chrome.runtime.sendMessage({ action: 'getConfig' })
  .then(config => console.log('扩展配置:', config));
```

### 步骤 3: 检查当前标签页状态
```javascript
// 在浏览器控制台中运行
chrome.runtime.sendMessage({ action: 'getCurrentTabStatus' })
  .then(status => console.log('标签页状态:', status));
```

### 步骤 4: 检查历史记录设置
```javascript
// 在浏览器控制台中运行
chrome.storage.local.get(['historySettings'])
  .then(settings => console.log('历史记录设置:', settings));
```

### 步骤 5: 检查历史记录
```javascript
// 在浏览器控制台中运行
chrome.storage.local.get(['historyRecords'])
  .then(records => console.log('历史记录:', records));
```

### 步骤 6: 检查浏览器历史记录
```javascript
// 在浏览器控制台中运行
chrome.history.search({
  text: '91porny',
  maxResults: 10,
  startTime: Date.now() - (24 * 60 * 60 * 1000)
}).then(history => console.log('浏览器历史记录:', history));
```

## 解决方案

### 方案 1: 确保扩展启用
1. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
2. 找到 AutoPurge 扩展
3. 确保开关是开启状态

### 方案 2: 检查域名配置
1. 打开扩展选项页面
2. 检查 "Domain Management" 部分
3. 确认 `91porny.com` 在列表中

### 方案 3: 启用历史记录功能
1. 打开扩展选项页面
2. 找到 "History Records" 部分
3. 确保 "Auto Record" 开关是开启的

### 方案 4: 手动测试
1. 访问 `https://91porny.com`
2. 等待 10 秒延迟时间
3. 检查扩展的 popup 界面
4. 查看是否有倒计时或删除状态

### 方案 5: 重新加载扩展
1. 在扩展管理页面点击"重新加载"按钮
2. 重新访问测试网站

## 代码分析

### 域名匹配逻辑
```javascript
function shouldPurgeDomain(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  // 检查预设域名
  for (const domain of presetDomains) {
    if (hostname === domain || hostname.endsWith('.' + domain)) {
      return true;
    }
  }
  
  // 检查用户域名
  for (const domain of config.userDomains) {
    if (hostname === domain || hostname.endsWith('.' + domain)) {
      return true;
    }
  }
  
  return false;
}
```

### 历史记录记录逻辑
```javascript
async function recordHistoryDeletion(url, title, domain) {
  // 检查是否启用自动记录
  const settings = await chrome.storage.local.get(['historySettings']);
  if (!settings.historySettings.autoRecord) {
    return; // 自动记录未启用
  }
  
  // 创建记录
  const record = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    url: url,
    title: title || '',
    domain: domain || '',
    deletedAt: Date.now()
  };
  
  // 保存记录
  const stored = await chrome.storage.local.get(['historyRecords']);
  let historyRecords = stored.historyRecords || [];
  historyRecords.unshift(record);
  await chrome.storage.local.set({ historyRecords: historyRecords });
}
```

## 常见问题

### Q: 为什么扩展检测到了网站但没有删除历史记录？
A: 可能是延迟删除机制，需要等待配置的延迟时间（默认10秒）。

### Q: 为什么历史记录功能显示已启用但没有记录？
A: 可能是域名匹配失败，或者浏览器历史记录中确实没有该网站。

### Q: 如何确认扩展是否正常工作？
A: 使用测试页面或浏览器控制台检查扩展状态和配置。

### Q: 如何手动触发历史记录删除？
A: 在扩展选项页面可以手动清除最近的历史记录。

## 联系支持

如果问题仍然存在，请提供以下信息：
1. 扩展版本号
2. Chrome 版本号
3. 调试日志输出
4. 测试页面结果
5. 具体的错误信息

---

**注意**: 此扩展用于自动清理敏感网站的浏览历史，请确保在合法合规的前提下使用。

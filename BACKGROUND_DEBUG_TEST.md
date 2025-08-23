# 背景脚本调试测试

## 🚨 当前问题
扩展返回 `undefined` 响应，需要检查背景脚本是否正常启动。

## 🔧 立即修复步骤

### 1. 重新加载扩展
1. 打开 `chrome://extensions/`
2. 找到 AutoPurge 扩展
3. 点击**刷新**按钮 🔄
4. 确保扩展显示为**已启用**

### 2. 检查背景脚本状态
1. 在扩展页面，找到 AutoPurge 扩展
2. 查看是否有 **"service worker"** 链接
3. 如果没有，说明背景脚本未启动
4. 点击**刷新**按钮重试

### 3. 查看背景脚本日志
1. 点击 **"service worker"** 链接
2. 在控制台中应该看到：
   ```
   AutoPurge extension initializing...
   Loaded 20 preset domains
   AutoPurge extension initialized successfully
   Initial service worker setup completed
   ```

### 4. 手动测试背景脚本
在背景脚本控制台中运行：
```javascript
// 测试配置
console.log('Config:', config);
console.log('Preset domains:', presetDomains);

// 测试消息处理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Test message received:', message);
  sendResponse({test: 'working'});
  return true;
});
```

### 5. 测试popup通信
在popup控制台中运行：
```javascript
// 测试通信
chrome.runtime.sendMessage({action: 'test'}).then(response => {
  console.log('Test response:', response);
});
```

## 🔥 紧急修复方案

如果背景脚本仍然不工作，尝试：

### 方法1: 简化初始化
编辑 `background.js`，替换初始化部分：
```javascript
// 替换复杂的初始化为简单版本
console.log('AutoPurge background script loaded');

let config = {
  enabled: true,
  delaySec: 10,
  userDomains: [],
  usage: { deletionsToday: 0, deletionsTotal: 0 }
};

let presetDomains = ['xvideos.com', 'pornhub.com'];

// 简化消息处理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  if (message.action === 'getConfig') {
    sendResponse(config);
  } else if (message.action === 'getCurrentTabStatus') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        sendResponse({
          isMatched: false,
          hostname: tabs[0].url ? new URL(tabs[0].url).hostname : 'unknown',
          url: tabs[0].url,
          title: tabs[0].title
        });
      } else {
        sendResponse({isMatched: false, error: 'No active tab'});
      }
    });
  } else {
    sendResponse({error: 'Unknown action'});
  }
  
  return true;
});
```

### 方法2: 检查权限
确保manifest.json中有：
```json
{
  "permissions": [
    "history",
    "storage", 
    "tabs",
    "webNavigation"
  ]
}
```

### 方法3: 重置扩展
1. 完全删除扩展
2. 重新添加扩展文件夹
3. 重启Chrome浏览器

## ✅ 成功指标

背景脚本正常工作时应该看到：
- ✅ "service worker" 链接可点击
- ✅ 控制台显示初始化成功日志
- ✅ popup可以收到有效响应
- ✅ 扩展图标显示正常

## 📞 如果还有问题

请提供：
1. Chrome 版本号
2. 背景脚本完整控制台日志
3. 任何错误消息截图
4. 扩展页面状态截图

---

**立即行动**: 重新加载扩展并检查背景脚本状态！

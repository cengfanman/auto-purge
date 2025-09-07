# AutoPurge 逐步调试指南

## 简化目标
将复杂的历史记录模块简化为最简单的 "TEST" 文本，用于逐步调试显示问题。

## 已完成的简化

### 1. HTML 简化
- ✅ 移除了复杂的历史记录列表
- ✅ 移除了统计信息显示
- ✅ 移除了搜索和过滤功能
- ✅ 替换为简单的 "TEST" 文本
- ✅ 添加了调试信息显示

### 2. JavaScript 简化
- ✅ 移除了复杂的历史记录相关变量
- ✅ 移除了复杂的事件监听器
- ✅ 添加了简单的 `updateTestInfo()` 函数
- ✅ 简化了调试检查

### 3. 测试内容
现在 History Records 页面只显示：
```
TEST
This is a simple test to debug the display issue.
If you can see this text, the content is loading correctly.

Debug Info:
Current time: [当前时间]
Page loaded: [页面加载时间]
Section ID: history
```

## 调试步骤

### 步骤 1: 打开选项页面
1. 在 Chrome 中访问 `chrome://extensions/`
2. 找到 AutoPurge 扩展
3. 点击"选项"按钮

### 步骤 2: 测试导航
1. 点击左侧的 "History Records" 菜单
2. 检查右侧是否显示 "TEST" 文本
3. 如果仍然只看到纯色块，继续下一步

### 步骤 3: 运行调试命令
在选项页面的控制台中运行：

```javascript
// 检查页面状态
window.debugOptions.checkPageStatus();
```

### 步骤 4: 强制显示内容
如果仍然看不到内容，运行：

```javascript
// 强制显示所有内容
window.debugOptions.forceShowAll();
```

### 步骤 5: 检查关键元素
```javascript
// 检查测试元素是否存在
console.log('currentTimeSpan:', document.getElementById('currentTime'));
console.log('pageLoadedSpan:', document.getElementById('pageLoaded'));

// 检查历史记录部分是否存在
const historySection = document.getElementById('history');
console.log('History section:', historySection);
console.log('History section display:', historySection.style.display);
console.log('History section classes:', historySection.className);
```

### 步骤 6: 手动修复
如果元素存在但不可见，运行：

```javascript
// 手动显示历史记录部分
const historySection = document.getElementById('history');
historySection.style.display = 'block';
historySection.classList.add('active');

// 更新测试信息
if (typeof updateTestInfo === 'function') {
  updateTestInfo();
}
```

## 预期结果

修复后你应该能看到：
- ✅ 左侧导航菜单正常显示
- ✅ 点击 "History Records" 后右侧显示 "TEST" 文本
- ✅ 显示当前时间和页面加载时间
- ✅ 不再出现纯色块

## 问题排查

### 如果仍然看到纯色块：
1. 检查控制台是否有 JavaScript 错误
2. 确认扩展已重新加载
3. 尝试强制刷新页面（Ctrl+F5）

### 如果看不到 "TEST" 文本：
1. 检查 `currentTimeSpan` 和 `pageLoadedSpan` 元素是否存在
2. 检查 `updateTestInfo()` 函数是否被调用
3. 检查 CSS 样式是否覆盖了内容

### 如果导航不工作：
1. 检查导航事件监听器是否正确设置
2. 尝试手动切换内容部分

## 下一步

一旦能看到 "TEST" 文本，我们就可以：
1. 逐步添加回历史记录功能
2. 测试每个功能模块
3. 定位具体的问题所在

---

**注意**: 这个简化版本只用于调试，不包含完整的历史记录功能。

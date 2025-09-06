# AutoPurge 选项页面显示问题修复指南

## 问题描述
AutoPurge 扩展的选项页面出现空白显示问题，无法看到内容。

## 问题原因
1. **JavaScript 加载问题**：options.js 可能没有正确加载或执行
2. **DOM 元素获取失败**：JavaScript 无法找到页面元素
3. **CSS 显示问题**：内容部分被隐藏或样式错误
4. **导航功能失效**：点击导航菜单无法切换内容

## 解决方案

### 方案 1: 使用修复脚本（推荐）

1. **打开选项页面**
   - 在 Chrome 中访问 `chrome://extensions/`
   - 找到 AutoPurge 扩展
   - 点击"选项"按钮

2. **打开浏览器控制台**
   - 按 `F12` 打开开发者工具
   - 切换到 "Console" 标签

3. **运行修复脚本**
   ```javascript
   // 复制并粘贴以下代码到控制台
   fixDisplayIssue();
   ```

4. **如果基本修复无效，尝试高级修复**
   ```javascript
   advancedFix();
   ```

### 方案 2: 使用测试页面

1. **打开测试页面**
   - 在浏览器中打开 `test-options.html`
   - 点击"打开选项页面"按钮

2. **检查测试结果**
   - 查看页面上的测试结果
   - 根据结果进行相应处理

### 方案 3: 手动修复

1. **检查页面状态**
   ```javascript
   diagnoseIssue();
   ```

2. **强制显示所有内容**
   ```javascript
   // 在控制台中运行
   const sections = document.querySelectorAll('.content-section');
   sections.forEach(section => {
     section.style.display = 'block';
     section.classList.add('active');
   });
   ```

3. **重置导航**
   ```javascript
   // 在控制台中运行
   const navItems = document.querySelectorAll('.nav-item');
   navItems.forEach((item, index) => {
     item.classList.remove('active');
     if (index === 0) {
       item.classList.add('active');
     }
   });
   ```

## 调试工具

### 内置调试函数
在选项页面的控制台中可以使用以下函数：

```javascript
// 检查页面状态
window.debugOptions.checkPageStatus();

// 强制显示所有内容
window.debugOptions.forceShowAll();

// 重置到默认状态
window.debugOptions.resetToDefault();

// 测试历史记录功能
window.debugOptions.testHistoryRecords();
```

### 诊断信息
```javascript
// 运行完整诊断
diagnoseIssue();

// 检查扩展状态
chrome.runtime.sendMessage({ action: 'getConfig' })
  .then(config => console.log('扩展配置:', config));
```

## 常见问题

### Q: 修复后页面仍然空白
A: 尝试以下步骤：
1. 刷新页面（Ctrl+F5）
2. 重新加载扩展
3. 检查控制台是否有 JavaScript 错误

### Q: 导航菜单无法点击
A: 运行以下代码：
```javascript
// 重新设置导航事件
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const targetSection = item.dataset.section;
    document.querySelectorAll('.content-section').forEach(section => {
      section.style.display = section.id === targetSection ? 'block' : 'none';
    });
  });
});
```

### Q: 历史记录页面没有内容
A: 检查以下设置：
1. 确保扩展已启用
2. 检查 `autoRecord` 设置是否为 `true`
3. 访问一个被监控的网站（如 91porny.com）
4. 等待延迟时间结束

## 预防措施

1. **定期更新扩展**
2. **避免修改扩展文件**
3. **使用官方版本**
4. **定期清理浏览器缓存**

## 联系支持

如果问题仍然存在，请提供以下信息：
1. Chrome 版本号
2. 扩展版本号
3. 控制台错误信息
4. 诊断结果

---

**注意**: 此修复脚本仅用于解决显示问题，不会影响扩展的核心功能。

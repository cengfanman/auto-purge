# AutoPurge 纯色块显示问题修复指南

## 问题描述
AutoPurge 扩展选项页面只显示纯色块（蓝色），点击后变成灰色，无法看到任何内容。

## 问题原因
这是典型的 **CSS 显示问题**：
1. `.content-section` 默认设置为 `display: none`
2. 只有添加 `.active` 类才会显示内容
3. JavaScript 可能没有正确添加 `.active` 类
4. 导致内容区域被背景色覆盖

## 修复方案

### 方案 1: 使用修复后的文件（推荐）

我已经修复了以下文件：
- `extension/options.html` - 添加了强制显示样式
- `quick-fix.js` - 快速修复脚本

**步骤：**
1. 重新加载扩展
2. 打开选项页面
3. 如果仍有问题，在控制台运行：`quickFix()`

### 方案 2: 手动修复

在选项页面的浏览器控制台中运行：

```javascript
// 强制显示所有内容部分
const sections = document.querySelectorAll('.content-section');
sections.forEach((section, index) => {
  section.classList.remove('active');
  if (index === 0) {
    section.classList.add('active');
    section.style.display = 'block';
  } else {
    section.style.display = 'none';
  }
});

// 修复导航菜单
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach((item, index) => {
  item.classList.remove('active');
  if (index === 0) {
    item.classList.add('active');
  }
});

console.log('✅ 修复完成');
```

### 方案 3: 使用测试页面

1. 打开 `test-fix.html`
2. 点击"测试修复效果"按钮
3. 查看内嵌的选项页面

## 修复内容

### CSS 修复
```css
/* 添加了 !important 规则确保显示 */
.content-section.active {
  display: block !important;
}

/* 强制显示修复 */
.content-section[style*="display: block"] {
  display: block !important;
}
```

### HTML 修复
```html
<!-- 添加了内联样式确保默认显示 -->
<div class="content-section active" id="overview" style="display: block;">
```

### JavaScript 修复
- 改进了导航切换逻辑
- 添加了强制显示函数
- 修复了事件监听器

## 验证修复

修复后你应该能看到：
1. ✅ 左侧导航菜单正常显示
2. ✅ 右侧内容区域显示具体内容
3. ✅ 点击导航菜单可以切换内容
4. ✅ History Records 页面显示历史记录列表
5. ✅ Security 页面显示安全设置

## 常见问题

### Q: 修复后仍然只看到纯色块
A: 尝试以下步骤：
1. 刷新页面（Ctrl+F5）
2. 重新加载扩展
3. 在控制台运行 `quickFix()`

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

### Q: 历史记录页面空白
A: 检查以下设置：
1. 确保扩展已启用
2. 检查 `autoRecord` 设置
3. 访问被监控的网站
4. 等待延迟时间结束

## 预防措施

1. **不要修改扩展的 CSS 文件**
2. **使用官方版本**
3. **定期更新扩展**
4. **避免浏览器缓存问题**

---

**注意**: 此修复解决了纯色块显示问题，现在你应该能看到完整的选项页面内容了。

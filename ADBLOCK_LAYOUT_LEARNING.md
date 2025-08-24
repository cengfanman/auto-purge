# AdBlock 风格左右布局学习指南

## 概述

这个文档详细说明了如何实现类似 AdBlock 的经典左右布局设计。AdBlock 的 options 页面采用了左侧导航 + 右侧内容的经典布局模式，这种设计在浏览器扩展中非常常见且用户友好。

## 布局结构

### 1. 整体布局 (`.app-container`)
```css
.app-container {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}
```
- 使用 `flexbox` 实现左右分栏
- 设置 `height: 100vh` 占满整个视口高度
- 背景色采用浅灰色 `#f5f5f5`

### 2. 左侧导航栏 (`.sidebar`)
```css
.sidebar {
  width: 280px;
  background: #2c3e50;
  color: white;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  z-index: 1000;
}
```

**特点：**
- 固定宽度 `280px`，适合显示导航菜单
- 深色主题 `#2c3e50`，与内容区域形成对比
- 添加右侧阴影，增强层次感
- 设置 `z-index: 1000` 确保在最上层

### 3. 右侧内容区域 (`.content-area`)
```css
.content-area {
  flex: 1;
  overflow-y: auto;
  background: white;
}
```

**特点：**
- 使用 `flex: 1` 占据剩余空间
- 白色背景，与左侧形成对比
- 独立滚动，内容可以很长

## 导航设计

### 1. 导航项样式 (`.nav-item`)
```css
.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #34495e;
  border-left-color: #3498db;
}

.nav-item.active {
  background: #3498db;
  border-left-color: #2980b9;
}
```

**交互效果：**
- 悬停时背景色变化
- 左侧边框高亮显示当前选中项
- 平滑的过渡动画 `transition: all 0.2s ease`

### 2. 图标和文字布局
```css
.nav-item i {
  margin-right: 12px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-item span {
  font-size: 14px;
  font-weight: 500;
}
```

**设计要点：**
- 图标固定宽度，确保对齐
- 文字使用中等字重，提高可读性

## 内容区域设计

### 1. 内容头部 (`.content-header`)
```css
.content-header {
  padding: 25px 30px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}
```

**特点：**
- 使用 `position: sticky` 实现粘性定位
- 添加底部边框分隔线
- 设置 `z-index` 确保在内容之上

### 2. 内容卡片 (`.section-card`)
```css
.section-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
```

**设计原则：**
- 白色背景，简洁明了
- 圆角边框，现代感
- 轻微阴影，增强层次感
- 合理的内边距和外边距

## 响应式设计

### 移动端适配
```css
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .app-container {
    flex-direction: column;
  }
  
  .content-area {
    height: auto;
  }
}
```

**策略：**
- 在小屏幕上改为垂直布局
- 侧边栏变为顶部导航
- 内容区域高度自适应

## JavaScript 交互

### 1. 导航切换
```javascript
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.dataset.section;
      
      // 更新活跃导航项
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // 显示目标内容区域
      contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetSection) {
          section.classList.add('active');
        }
      });
    });
  });
}
```

### 2. 内容区域切换
```css
.content-section {
  display: none;
  animation: fadeIn 0.3s ease;
}

.content-section.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## 设计优势

### 1. 用户体验
- **清晰的信息架构**：左侧导航提供全局概览
- **快速导航**：用户可以快速在不同功能间切换
- **一致的视觉语言**：统一的颜色、间距和交互模式

### 2. 开发维护
- **模块化设计**：每个功能区域独立，易于维护
- **可扩展性**：新增功能只需添加导航项和内容区域
- **代码复用**：统一的样式和交互模式

### 3. 性能优化
- **按需加载**：只显示当前需要的内容
- **平滑动画**：使用 CSS 动画提升用户体验
- **响应式设计**：适配不同设备尺寸

## 最佳实践

### 1. 导航设计
- 使用描述性的图标和文字
- 保持导航项数量合理（建议 5-8 个）
- 添加视觉分隔符区分功能组

### 2. 内容组织
- 每个内容区域应该有明确的标题和描述
- 使用卡片式布局组织相关内容
- 保持一致的间距和对齐

### 3. 交互反馈
- 提供悬停和点击状态的视觉反馈
- 使用平滑的过渡动画
- 确保当前页面的导航项高亮显示

## 总结

AdBlock 风格的左右布局是一种经过验证的优秀设计模式，特别适合功能丰富的浏览器扩展。通过合理的布局规划、清晰的视觉层次和流畅的交互体验，可以为用户提供专业、易用的设置界面。

这种布局的核心优势在于：
1. **信息层次清晰**：左侧导航 + 右侧内容的经典组合
2. **交互体验流畅**：平滑的切换动画和直观的导航反馈
3. **设计风格现代**：简洁的卡片式设计和合理的视觉层次
4. **扩展性良好**：易于添加新功能和维护现有代码

通过学习和应用这些设计原则，可以创建出专业级的浏览器扩展设置页面。

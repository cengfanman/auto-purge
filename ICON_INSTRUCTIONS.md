# 图标获取说明

## Chrome Web Store 图标要求

Chrome Web Store 需要以下格式的图标：

### 必需图标
- **128x128 PNG格式** - 用于扩展详情页面
- 透明背景
- 清晰可识别
- 文件大小建议小于100KB

## 获取图标的几种方法

### 方法1：在线SVG转PNG工具
1. 访问 [Convertio](https://convertio.co/svg-png/) 或 [CloudConvert](https://cloudconvert.com/svg-to-png)
2. 上传 `extension/icon.svg` 文件
3. 设置输出尺寸为128x128像素
4. 下载PNG格式图标

### 方法2：使用浏览器转换
1. 在Chrome中打开 `extension/icon.svg`
2. 右键点击图像，选择"另存为"
3. 选择PNG格式，保存为128x128尺寸

### 方法3：使用设计软件
- **Figma**: 免费在线设计工具
- **Canva**: 简单易用的设计平台
- **GIMP**: 免费开源的图像编辑软件
- **Photoshop**: 专业图像编辑软件

### 方法4：使用命令行工具（macOS）
如果你安装了ImageMagick：
```bash
convert extension/icon.svg -resize 128x128 icon.png
```

## 图标设计建议

### 视觉元素
- 使用简洁的设计
- 确保在小尺寸下清晰可读
- 使用对比度高的颜色
- 避免过于复杂的细节

### 品牌一致性
- 图标应该反映扩展的功能
- 使用一致的颜色方案
- 保持与扩展名称的关联性

## 当前SVG图标说明

我们已经在 `extension/icon.svg` 中创建了一个基础图标：
- 红色圆形背景
- 白色垃圾桶图标
- 绿色自动清理指示器
- "AUTO"文字标签

## 下一步操作

1. 将SVG转换为128x128 PNG格式
2. 将PNG图标重命名为 `icon.png`
3. 放置在 `extension/` 目录中
4. 更新 `manifest.json` 中的图标引用
5. 重新构建扩展包

## 图标文件命名

建议的文件结构：
```
extension/
├── icon.png          # 128x128 PNG图标
├── icon.svg          # 源SVG文件
├── manifest.json     # 扩展配置
└── ...其他文件
```

## 更新manifest.json

转换完成后，需要更新 `manifest.json`：

```json
{
  "icons": {
    "16": "icon.png",
    "48": "icon.png", 
    "128": "icon.png"
  }
}
```

---

**注意**: 图标是扩展品牌的重要组成部分，建议花时间设计一个专业、美观的图标，这将有助于提高用户在Chrome Web Store中的点击率和安装率。

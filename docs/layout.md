# Canvas Grid App

一个基于React + TypeScript + Vite的Canvas网格绘制项目

## 功能特性

### Phase 1
- ✅ 响应式Canvas画布(自适应窗口大小)
- ✅ 50px间距的网格线
- ✅ 浅灰色网格样式
- ✅ 高DPI屏幕支持(清晰显示)

### Phase 2
- ✅ 左侧Sidebar导航栏(240px宽)
- ✅ Logo展示区域
- ✅ 垂直Toolbar工具栏(60px宽)
- ✅ 三种工具类型:设备、工具、连接线
- ✅ 图标+文字的工具按钮
- ✅ 工具选中状态管理
- ✅ Draw.io风格的UI设计

## 技术栈

- React 18
- TypeScript
- Vite
- 原生Canvas API

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

浏览器访问: http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx              # Canvas画布组件
│   │   └── Canvas.module.css       # Canvas样式
│   ├── Sidebar/
│   │   ├── Sidebar.tsx             # 左侧导航栏
│   │   └── Sidebar.module.css      # Sidebar样式
│   ├── Toolbar/
│   │   ├── Toolbar.tsx             # 垂直工具栏
│   │   └── Toolbar.module.css      # Toolbar样式
│   └── CanvasWorkspace/
│       ├── CanvasWorkspace.tsx     # 工作区容器(Toolbar + Canvas)
│       └── CanvasWorkspace.module.css # Workspace样式
├── App.tsx                          # 主应用组件
├── App.css                          # 应用样式
├── main.tsx                         # 入口文件
└── index.css                        # 全局样式
```

## 布局说明

```
┌─────────────────────────────────────────────────┐
│                整个应用窗口                        │
├──────────┬──────────────────────────────────────┤
│          │      CanvasWorkspace                 │
│          ├─────────┬────────────────────────────┤
│  Sidebar │ Toolbar │        Canvas             │
│  (240px) │ (60px)  │      (自适应剩余空间)        │
│          │         │                            │
│          │         │                            │
│          │         │                            │
└──────────┴─────────┴────────────────────────────┘
```

## 核心实现

### Canvas响应式实现

- 使用`ResizeObserver`或`window.resize`监听窗口变化
- 动态设置canvas的width/height属性
- 考虑devicePixelRatio以支持高DPI屏幕

### 网格绘制算法

- 使用Canvas 2D API的`moveTo`和`lineTo`绘制线条
- 根据GRID_SIZE(50px)计算垂直和水平线条位置
- 使用循环遍历绘制所有网格线

## 下一步开发计划 (Phase 2+)

- [ ] 添加鼠标交互(点击、拖拽)
- [ ] 实现缩放功能
- [ ] 实现平移功能
- [ ] 在Canvas上绘制图形元素
- [ ] 添加撤销/重做功能

## License

MIT
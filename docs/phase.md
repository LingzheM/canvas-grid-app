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

### Phase 3
- ✅ 点击工具后在Canvas上创建图形
- ✅ 设备图形: 120x80px圆角矩形
- ✅ 工具图形: 100x100px圆形
- ✅ 图形居中显示文字标签
- ✅ 创建后自动取消工具选中
- ✅ ESC键取消工具选中
- ✅ 图形数据持久化(localStorage)
- ✅ 刷新页面保持图形显示

### Phase 4
- ✅ 连接线工具 - 拖拽创建连接
- ✅ 连接点系统(设备4个点,工具4个点)
- ✅ 连接点自动捕捉(15px范围)
- ✅ 实时预览线(拖拽时显示)
- ✅ 带箭头的连接线(指向终点)
- ✅ 连接线数据持久化
- ✅ 防止自连接(同一图形)

### Phase 5
- ✅ 图形选中系统(蓝色虚线框)
- ✅ 图形拖拽移动
- ✅ 拖拽半透明预览
- ✅ 连接线实时跟随更新
- ✅ 边界限制(不能拖出Canvas)
- ✅ 点击空白取消选中
- ✅ 工具冲突处理(连接线工具优先连接点)

### Phase 6
- ✅ 智能对齐辅助线系统
- ✅ 创建图形时的预览和对齐
- ✅ 拖拽移动时的对齐线显示
- ✅ 自动吸附功能(8px范围)
- ✅ 多种对齐类型(左右中/上下中/边对边)
- ✅ 品红色对齐辅助线
- ✅ 性能优化(最多4条辅助线)

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
├── types/
│   └── canvas.ts                    # TypeScript类型定义
├── utils/
│   ├── connectionUtils.ts           # 连接线工具函数
│   ├── shapeUtils.ts                # 图形工具函数
│   └── alignmentUtils.ts            # 对齐检测工具函数(NEW)
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx               # 主Canvas组件
│   │   ├── Canvas.module.css        # Canvas样式
│   │   └── hooks/
│   │       ├── useConnectionTool.ts # 连接线拖拽Hook
│   │       ├── useShapeDrag.ts      # 图形拖拽Hook
│   │       └── useShapeCreation.ts  # 图形创建预览Hook(NEW)
│   ├── Sidebar/
│   │   ├── Sidebar.tsx              # 左侧导航栏
│   │   └── Sidebar.module.css       # Sidebar样式
│   ├── Toolbar/
│   │   ├── Toolbar.tsx              # 垂直工具栏
│   │   └── Toolbar.module.css       # Toolbar样式
│   └── CanvasWorkspace/
│       ├── CanvasWorkspace.tsx      # 工作区容器(状态管理)
│       └── CanvasWorkspace.module.css # Workspace样式
├── App.tsx                           # 主应用组件
├── App.css                           # 应用样式
├── main.tsx                          # 入口文件
└── index.css                         # 全局样式
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

## 下一步开发计划 (Phase 6+)

- [ ] 图形的删除功能(Delete键)
- [ ] 多选图形(Ctrl+点击或框选)
- [ ] 批量移动多个图形
- [ ] 图形属性编辑面板
- [ ] 图形的复制粘贴
- [ ] 缩放和平移功能
- [ ] 撤销/重做功能
- [ ] 导出为图片/JSON
- [ ] 连接线样式自定义(虚线、曲线等)
- [ ] 图形旋转功能

## 使用说明

### 创建图形
1. 点击左侧工具栏的"设备"或"工具"按钮
2. 在Canvas画布上**移动鼠标**,会看到**半透明预览图形**
3. 当接近其他图形时,会自动显示**品红色对齐辅助线**
4. 图形会**自动吸附**到对齐位置(8px范围内)
5. 点击放置图形,工具自动取消选中

### 移动图形
1. 确保**没有工具选中**(所有工具都未高亮)
2. 点击要移动的图形,图形会显示**蓝色虚线选中框**
3. 按住鼠标**拖拽图形**,图形会半透明显示预览位置
4. 拖拽时也会显示**对齐辅助线**和**自动吸附**
5. 释放鼠标完成移动,连接线会自动更新
6. 点击空白区域取消选中

### 创建连接线
1. 点击左侧工具栏的"连接线"按钮
2. 所有图形上会显示4个连接点(灰色小圆点)
3. 在起点图形的连接点上**按下鼠标**
4. **拖拽鼠标**到终点图形的连接点
5. **释放鼠标**完成连接
6. 会自动绘制带箭头的连接线

### 取消工具选中
- 按`ESC`键
- 或再次点击已选中的工具

### 连接点说明
- **设备**: 上、右、下、左四个中点
- **工具**: 0°、90°、180°、270°四个点
- 点击附近15px范围内自动捕捉到最近的连接点

### 边界限制
- 拖拽图形时,图形**不能超出Canvas边界**
- 系统会自动限制图形在可视区域内

### 智能对齐辅助线
- **品红色实线**表示对齐关系
- **自动吸附**: 接近对齐位置8px范围内自动调整到精确对齐
- **容差检测**: 5px范围内显示对齐线
- 最多同时显示4条辅助线(2条水平+2条垂直)

#### 对齐类型定义 (AlignmentType)

命名格式: **"预览图形的边 To 已有图形的边"**

**垂直方向对齐 (orientation: 'vertical')**

| Type | 含义 | 检测条件 | 吸附计算 |
|------|------|----------|----------|
| `left` | 预览左边 对齐 已有左边 | `preview.left = existing.left` | `x = position + halfWidth` |
| `right` | 预览右边 对齐 已有右边 | `preview.right = existing.right` | `x = position - halfWidth` |
| `centerX` | 预览垂直中心 对齐 已有垂直中心 | `preview.centerX = existing.centerX` | `x = position` |
| `leftToRight` | 预览左边 对齐 已有右边 | `preview.left = existing.right` | `x = position + halfWidth` |
| `rightToLeft` | 预览右边 对齐 已有左边 | `preview.right = existing.left` | `x = position - halfWidth` |

**水平方向对齐 (orientation: 'horizontal')**

| Type | 含义 | 检测条件 | 吸附计算 |
|------|------|----------|----------|
| `top` | 预览上边 对齐 已有上边 | `preview.top = existing.top` | `y = position + halfHeight` |
| `bottom` | 预览下边 对齐 已有下边 | `preview.bottom = existing.bottom` | `y = position - halfHeight` |
| `centerY` | 预览水平中心 对齐 已有水平中心 | `preview.centerY = existing.centerY` | `y = position` |
| `topToBottom` | 预览上边 对齐 已有下边 | `preview.top = existing.bottom` | `y = position + halfHeight` |
| `bottomToTop` | 预览下边 对齐 已有上边 | `preview.bottom = existing.top` | `y = position - halfHeight` |

**位置关系示意图**

```
垂直方向对齐:

  leftToRight (预览在右侧紧邻)     rightToLeft (预览在左侧紧邻)
  ┌──────┐┌──────┐                ┌──────┐┌──────┐
  │已有  ││预览  │                │预览  ││已有  │
  └──────┘└──────┘                └──────┘└──────┘
          ↑                               ↑
    预览.left = 已有.right         预览.right = 已有.left

水平方向对齐:

  topToBottom (预览在下方紧邻)     bottomToTop (预览在上方紧邻)
  ┌──────┐                        ┌──────┐
  │已有  │                        │预览  │
  └──────┘                        └──────┘
  ┌──────┐                        ┌──────┐
  │预览  │                        │已有  │
  └──────┘                        └──────┘
      ↑                               ↑
预览.top = 已有.bottom         预览.bottom = 已有.top
```

### 数据持久化
- 创建的图形和连接线会自动保存到浏览器的localStorage
- 刷新页面后图形和连接线会自动恢复
- 如果需要清空所有数据,可以清除浏览器缓存或重启开发服务器

## License

MIT
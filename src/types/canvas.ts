export type ShapeType = 'device' | 'tool';

export interface Shape {
  id: string;
  type: ShapeType;
  x: number; // 中心点x坐标
  y: number; // 中心点y坐标
  color: string;
  label: string;
}

export interface DeviceShape extends Shape {
  type: 'device';
  width: 120;
  height: 80;
}

export interface ToolShape extends Shape {
  type: 'tool';
  radius: 50; // 直径100px,半径50px
}

export type CanvasShape = DeviceShape | ToolShape;

// 连接点位置类型
export type PortPosition = 'top' | 'right' | 'bottom' | 'left';

// 连接点接口
export interface Port {
  shapeId: string;
  position: PortPosition;
  x: number;
  y: number;
}

// 连接线接口
export interface Connection {
  id: string;
  fromShapeId: string;
  fromPort: PortPosition;
  toShapeId: string;
  toPort: PortPosition;
  color: string;
}

// 拖拽状态接口
export interface DragState {
  isDragging: boolean;
  shapeId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  previewX: number;
  previewY: number;
}

// 对齐线类型
export type AlignmentType = 
  | 'left'           // 左边线对齐
  | 'right'          // 右边线对齐
  | 'centerX'        // 垂直中心线对齐
  | 'top'            // 上边线对齐
  | 'bottom'         // 下边线对齐
  | 'centerY'        // 水平中心线对齐
  | 'leftToRight'    // 左边对右边
  | 'rightToLeft'    // 右边对左边
  | 'topToBottom'    // 上边对下边
  | 'bottomToTop';   // 下边对上边

// 对齐线接口
export interface AlignmentGuide {
  type: AlignmentType;
  position: number;      // 对齐线的位置(x或y坐标)
  orientation: 'horizontal' | 'vertical';
  referenceShapeId: string;  // 参考图形的ID
}

// 等间距辅助线接口
export interface SpacingGuide {
  orientation: 'horizontal' | 'vertical';
  spacing: number;  // 间距大小(px)
  startShapeId: string; // 起始图形ID
  endShapeId: string; // 结束图形ID
  startX: number; // 线段起点
  startY: number; // 线段起点
  endX: number; // 线段终点
  endY: number; // 线段终点
}

// 创建预览状态
export interface CreationPreviewState {
  isActive: boolean;
  x: number;
  y: number;
  toolType: 'device' | 'tool' | null;
  color: string;
  label: string;
}
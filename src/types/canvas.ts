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
    x: number; // 连接点的x坐标
    y: number; // 连接点的y坐标
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
  | 'left'
  | 'right'
  | 'centerX'
  | 'top'
  | 'bottom'
  | 'centerY'
  | 'leftToRight'
  | 'rightToLeft'
  | 'topToBottom'
  | 'bottomToTop';

// 对齐线接口
export interface AlignmentGuide {
  type: AlignmentType;
  position: number;
  orientation: 'horizontal' | 'vertical';
  referenceShapeId: string;
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
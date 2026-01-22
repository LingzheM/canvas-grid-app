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
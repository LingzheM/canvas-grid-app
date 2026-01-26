import type { CanvasShape, AlignmentGuide, AlignmentType } from '../types/canvas';

const ALIGNMENT_TOLERANCE = 5; // 对齐检测容差(px)
const SNAP_DISTANCE = 8; // 自动吸附距离(px)

/**
 * 获取图形的边界信息
 */
export const getShapeBounds = (shape: CanvasShape) => {
  if (shape.type === 'device') {
    const halfWidth = shape.width / 2;
    const halfHeight = shape.height / 2;
    return {
      left: shape.x - halfWidth,
      right: shape.x + halfWidth,
      top: shape.y - halfHeight,
      bottom: shape.y + halfHeight,
      centerX: shape.x,
      centerY: shape.y,
    };
  } else {
    // 工具(圆形) - 使用外接矩形
    const radius = shape.radius;
    return {
      left: shape.x - radius,
      right: shape.x + radius,
      top: shape.y - radius,
      bottom: shape.y + radius,
      centerX: shape.x,
      centerY: shape.y,
    };
  }
};

/**
 * 检测两个值是否在容差范围内对齐
 */
const isAligned = (value1: number, value2: number, tolerance = ALIGNMENT_TOLERANCE): boolean => {
  return Math.abs(value1 - value2) <= tolerance;
};

/**
 * 检测预览图形与现有图形的对齐关系
 * @param previewShape 预览图形(临时创建的形状对象)
 * @param existingShapes 已存在的图形列表
 * @param excludeShapeId 排除的图形ID(拖拽时排除自己)
 * @returns 对齐线数组
 */
export const detectAlignments = (
  previewShape: CanvasShape,
  existingShapes: CanvasShape[],
  excludeShapeId?: string
): AlignmentGuide[] => {
  const guides: AlignmentGuide[] = [];
  const previewBounds = getShapeBounds(previewShape);

  existingShapes.forEach((existingShape) => {
    // 跳过被排除的图形(拖拽时不与自己对齐)
    if (excludeShapeId && existingShape.id === excludeShapeId) {
      return;
    }

    const existingBounds = getShapeBounds(existingShape);

    // 垂直对齐线检测
    // 左边线对齐
    if (isAligned(previewBounds.left, existingBounds.left)) {
      guides.push({
        type: 'left',
        position: existingBounds.left,
        orientation: 'vertical',
        referenceShapeId: existingShape.id,
      });
    }

    // 右边线对齐
    if (isAligned(previewBounds.right, existingBounds.right)) {
      guides.push({
        type: 'right',
        position: existingBounds.right,
        orientation: 'vertical',
        referenceShapeId: existingShape.id,
      });
    }

    // 垂直中心线对齐
    if (isAligned(previewBounds.centerX, existingBounds.centerX)) {
      guides.push({
        type: 'centerX',
        position: existingBounds.centerX,
        orientation: 'vertical',
        referenceShapeId: existingShape.id,
      });
    }

    // 左边对右边(紧邻)
    if (isAligned(previewBounds.left, existingBounds.right)) {
      guides.push({
        type: 'leftToRight',
        position: existingBounds.right,
        orientation: 'vertical',
        referenceShapeId: existingShape.id,
      });
    }

    // 右边对左边(紧邻)
    if (isAligned(previewBounds.right, existingBounds.left)) {
      guides.push({
        type: 'rightToLeft',
        position: existingBounds.left,
        orientation: 'vertical',
        referenceShapeId: existingShape.id,
      });
    }

    // 水平对齐线检测
    // 上边线对齐
    if (isAligned(previewBounds.top, existingBounds.top)) {
      guides.push({
        type: 'top',
        position: existingBounds.top,
        orientation: 'horizontal',
        referenceShapeId: existingShape.id,
      });
    }

    // 下边线对齐
    if (isAligned(previewBounds.bottom, existingBounds.bottom)) {
      guides.push({
        type: 'bottom',
        position: existingBounds.bottom,
        orientation: 'horizontal',
        referenceShapeId: existingShape.id,
      });
    }

    // 水平中心线对齐
    if (isAligned(previewBounds.centerY, existingBounds.centerY)) {
      guides.push({
        type: 'centerY',
        position: existingBounds.centerY,
        orientation: 'horizontal',
        referenceShapeId: existingShape.id,
      });
    }

    // 上边对下边(紧邻)
    if (isAligned(previewBounds.top, existingBounds.bottom)) {
      guides.push({
        type: 'topToBottom',
        position: existingBounds.bottom,
        orientation: 'horizontal',
        referenceShapeId: existingShape.id,
      });
    }

    // 下边对上边(紧邻)
    if (isAligned(previewBounds.bottom, existingBounds.top)) {
      guides.push({
        type: 'bottomToTop',
        position: existingBounds.top,
        orientation: 'horizontal',
        referenceShapeId: existingShape.id,
      });
    }
  });

  // 去重并限制数量(最多2条水平+2条垂直)
  return filterAlignmentGuides(guides);
};

/**
 * 过滤对齐线,避免重复和过多
 */
const filterAlignmentGuides = (guides: AlignmentGuide[]): AlignmentGuide[] => {
  // 按方向分组
  const verticalGuides = guides.filter(g => g.orientation === 'vertical');
  const horizontalGuides = guides.filter(g => g.orientation === 'horizontal');

  // 去重:相同position的只保留一条
  const uniqueVertical = Array.from(
    new Map(verticalGuides.map(g => [g.position, g])).values()
  ).slice(0, 2); // 最多2条垂直线

  const uniqueHorizontal = Array.from(
    new Map(horizontalGuides.map(g => [g.position, g])).values()
  ).slice(0, 2); // 最多2条水平线

  return [...uniqueVertical, ...uniqueHorizontal];
};

/**
 * 应用吸附效果,返回调整后的坐标
 */
export const applySnapping = (
  previewShape: CanvasShape,
  alignmentGuides: AlignmentGuide[]
): { x: number; y: number } => {
  let { x, y } = previewShape;
  const bounds = getShapeBounds(previewShape);

  // 应用垂直吸附
  for (const guide of alignmentGuides) {
    if (guide.orientation === 'vertical') {
      const distance = Math.abs(guide.position - getAlignmentValue(bounds, guide.type));
      if (distance <= SNAP_DISTANCE) {
        // 计算需要调整的距离
        x = calculateSnapX(previewShape, guide);
        break; // 只吸附到第一条对齐线
      }
    }
  }

  // 应用水平吸附
  for (const guide of alignmentGuides) {
    if (guide.orientation === 'horizontal') {
      const distance = Math.abs(guide.position - getAlignmentValue(bounds, guide.type));
      if (distance <= SNAP_DISTANCE) {
        y = calculateSnapY(previewShape, guide);
        break;
      }
    }
  }

  return { x, y };
};

/**
 * 获取边界上对应对齐类型的值
 */
const getAlignmentValue = (bounds: ReturnType<typeof getShapeBounds>, type: AlignmentType): number => {
  switch (type) {
    case 'left':
    case 'rightToLeft':
      return bounds.left;
    case 'right':
    case 'leftToRight':
      return bounds.right;
    case 'centerX':
      return bounds.centerX;
    case 'top':
    case 'bottomToTop':
      return bounds.top;
    case 'bottom':
    case 'topToBottom':
      return bounds.bottom;
    case 'centerY':
      return bounds.centerY;
    default:
      return 0;
  }
};

/**
 * 计算吸附后的X坐标
 */
const calculateSnapX = (shape: CanvasShape, guide: AlignmentGuide): number => {

  switch (guide.type) {
    case 'left':
    case 'rightToLeft':
      return guide.position + (shape.type === 'device' ? shape.width / 2 : shape.radius);
    case 'right':
    case 'leftToRight':
      return guide.position - (shape.type === 'device' ? shape.width / 2 : shape.radius);
    case 'centerX':
      return guide.position;
    default:
      return shape.x;
  }
};

/**
 * 计算吸附后的Y坐标
 */
const calculateSnapY = (shape: CanvasShape, guide: AlignmentGuide): number => {

  switch (guide.type) {
    case 'top':
    case 'bottomToTop':
      return guide.position + (shape.type === 'device' ? shape.height / 2 : shape.radius);
    case 'bottom':
    case 'topToBottom':
      return guide.position - (shape.type === 'device' ? shape.height / 2 : shape.radius);
    case 'centerY':
      return guide.position;
    default:
      return shape.y;
  }
};

/**
 * 绘制对齐辅助线
 */
export const drawAlignmentGuides = (
  ctx: CanvasRenderingContext2D,
  guides: AlignmentGuide[],
  canvasWidth: number,
  canvasHeight: number
) => {
  ctx.strokeStyle = '#FF00FF'; // 品红色
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  guides.forEach((guide) => {
    ctx.beginPath();
    if (guide.orientation === 'vertical') {
      // 垂直线
      ctx.moveTo(guide.position, 0);
      ctx.lineTo(guide.position, canvasHeight);
    } else {
      // 水平线
      ctx.moveTo(0, guide.position);
      ctx.lineTo(canvasWidth, guide.position);
    }
    ctx.stroke();
  });
};

export { ALIGNMENT_TOLERANCE, SNAP_DISTANCE };
import type { CanvasShape, AlignmentGuide, AlignmentType } from "../types/canvas";

const ALIGNMENT_TOLERANCE = 5;
const SNAP_DISTANCE = 8;

// 获取图形边界信息
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

// 检测两个值是否在容差范围内对齐
const isAligned = (value1: number, value2: number, tolerance = ALIGNMENT_TOLERANCE): boolean => {
    return Math.abs(value1 - value2) <= tolerance;
};

// 检测预览图形与现有图形的对齐关系
export const detectAlignments = (
    previewShape: CanvasShape,
    existingShapes: CanvasShape[],
    excludeShapeId?: string
): AlignmentGuide[] => {
    const guides: AlignmentGuide[] = [];
    const previewBounds = getShapeBounds(previewShape);

    existingShapes.forEach((existingShape) => {
        // 跳过被排除的图形
        if (excludeShapeId && existingShape.id === excludeShapeId) {
            return;
        }
        const existingBounds = getShapeBounds(existingShape);
        // 垂直对齐线检测
        // 左边线
        if (isAligned(previewBounds.left, existingBounds.left)) {
            guides.push({
                type: 'left',
                position: existingBounds.left,
                orientation: 'vertical',
                referenceShapeId: existingShape.id
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

        // 左边对右边
        if (isAligned(previewBounds.left, existingBounds.right)) {
            guides.push({
                type: 'leftToRight',
                position: existingBounds.right,
                orientation: 'vertical',
                referenceShapeId: existingShape.id,
            })
        };
        
        // 右边对左边
        if (isAligned(previewBounds.right, existingBounds.left)) {
            guides.push({
                type: 'rightToLeft',
                position: existingBounds.left,
                orientation: 'vertical',
                referenceShapeId: existingShape.id,
            });
        }

        // 水平线检测
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

        // 上边对下边
        if (isAligned(previewBounds.top, existingBounds.bottom)) {
            guides.push({
                type: 'topToBottom',
                position: existingBounds.bottom,
                orientation: 'horizontal',
                referenceShapeId: existingShape.id,
            });
        }

        // 下边对上边
        if (isAligned(previewBounds.bottom, existingBounds.top)) {
            guides.push({
                type: 'bottomToTop',
                position: existingBounds.top,
                orientation: 'horizontal',
                referenceShapeId: existingShape.id,
            });
        }
    });

    // 去重并且限制数量(最多两条水平+两条垂直)
    return filterAlignmentGuides(guides);
};

// 过滤对齐线
const filterAlignmentGuides = (guides: AlignmentGuide[]): AlignmentGuide[] => {
    // 按方向分组
    const verticalGuides = guides.filter(g => g.orientation === 'vertical');
    const horizontalGuides = guides.filter(g => g.orientation === 'vertical');

    // 去重复
    const uniqueVertical = Array.from(
        new Map(verticalGuides.map(g => [g.position, g])).values()
    ).slice(0, 2);

    const uniqueHorizontal = Array.from(
        new Map(horizontalGuides.map(g => [g.position, g])).values()
    ).slice(0, 2);

    return [...uniqueVertical, ...uniqueHorizontal];
}

// 应用吸附效果
export const applySnapping = (
    previewShape: CanvasShape,
    alignmentGuides: AlignmentGuide[]
): { x: number, y: number } => {
    let {x, y} = previewShape;
    const bounds = getShapeBounds(previewShape);

    // 应用垂直吸附
    for (const guide of alignmentGuides) {
        if (guide.orientation === 'vertical') {
            const distance = Math.abs(guide.position - getAlignmentValue(bounds, guide.type));
            if (distance <= SNAP_DISTANCE) {
                // 计算需要调整的距离
                x = calculateSnapX(previewShape, guide);
                break;
            }
        }
    }

    for (const guide of alignmentGuides) {
        if (guide.orientation === 'horizontal') {
            const distance = Math.abs(guide.position - getAlignmentValue(bounds, guide.type));
            if (distance <= SNAP_DISTANCE) {
                y = calculateSnapY(previewShape, guide);
                break;
            }
        }
    }
    return {x, y};
};

const getAlignmentValue = (bounds: ReturnType<typeof getShapeBounds>, type: AlignmentType): number => {
    switch (type) {
        case 'left':
        case 'leftToRight':
        case 'rightToLeft':
            return bounds.left;
        case 'right':
            return bounds.right;
        case 'centerX':
            return bounds.centerX;
        case 'top':
        case 'topToBottom':
        case 'bottomToTop':
            return bounds.top;
        case 'bottom':
            return bounds.bottom;
        case 'centerY':
            return bounds.centerY;
        default:
            return 0
    }
};

// 计算吸附后的x坐标
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

// 绘制对齐辅助线
export const drawAlignmentGuides = (
    ctx: CanvasRenderingContext2D,
    guides: AlignmentGuide[],
    canvasWidth: number,
    canvasHeight: number
) => {
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    guides.forEach((guide) => {
        ctx.beginPath();
        if (guide.orientation === 'vertical') {
            // 垂直线
            ctx.moveTo(guide.position, 0);
            ctx.lineTo(guide.position, canvasHeight);
        } else {
            ctx.moveTo(0, guide.position);
            ctx.lineTo(canvasWidth, guide.position);
        }
        ctx.stroke();
    });
};

export { ALIGNMENT_TOLERANCE, SNAP_DISTANCE };
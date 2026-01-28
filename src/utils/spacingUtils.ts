import type { CanvasShape, SpacingGuide } from "../types/canvas";
import { getShapeBounds } from "./alignmentUtils";

const SPACING_TOLERANCE = 5;    // 等间距检测容差
const CENTER_ALIGNMENT_TOLERANCE = 5;   // 中心线对齐容差

/**
 * 检查两个值是否在容差范围内相等
 */
const isApproximatelyEqual = (value1: number, value2: number, tolerance: number) : boolean => {
    return Math.abs(value1 - value2) <= tolerance;
}

/**
 * 检测预览图形与现有图形之间的等间距关系
 * @param previewShape 预览图形
 * @param existingShapes 已存在的图形列表
 * @param excludeShapeId 排除的图形(拖拽排除自己)
 */
export const detectEqualSpacing = (
    previewShape: CanvasShape,
    existingShapes: CanvasShape[],
    excludeShapeId?: string
): SpacingGuide[] => {
    const guides: SpacingGuide[] = [];
    
    // 过滤掉被排除的图形
    const shapes = excludeShapeId
        ? existingShapes.filter(s => s.id !== excludeShapeId)
        : existingShapes;
    
    // 检测水平方向等间距
    const horizontalGuides = detectHorizontalSpacing(previewShape, shapes);
    guides.push(...horizontalGuides);

    // 检测垂直方向等间距
    const verticalGuides = detectVerticalSpacing(previewShape, shapes);
    guides.push(...verticalGuides);

    return guides;
};

/**
 * 检测水平方向的等间距
 * @param previewShape 
 * @param existingShapes 
 */
const detectHorizontalSpacing = (
    previewShape: CanvasShape,
    existingShapes: CanvasShape[]
): SpacingGuide[] => {
    const guides: SpacingGuide[] = [];
    const previewBounds = getShapeBounds(previewShape);

    // 1. 找出所有与预览图形centerY对齐的图形
    const alignedShapes = existingShapes.filter(shape => {
        const bounds = getShapeBounds(shape);
        return isApproximatelyEqual(
            bounds.centerY,
            previewBounds.centerY,
            CENTER_ALIGNMENT_TOLERANCE
        );
    });

    if (alignedShapes.length === 0) return guides;

    // 2. 将所有图形(包括预览)按centerX排序
    const allShapes = [...alignedShapes, previewShape].sort((a, b) => {
        const aBounds = getShapeBounds(a);
        const bBounds = getShapeBounds(b);
        return aBounds.centerX - bBounds.centerX;
    });

    // 3. 找到预览图形在排序后的位置
    const previewIndex = allShapes.findIndex(s => s.id === previewShape.id);

    // 4. 从预览图形向左右扩展, 查找连续的等间距
    const spacings = calculateHorizontalSpacings(allShapes);
    const equalSpacingsGroups = findEqualSpacingGroups(spacings, previewIndex);

    // 5. 为每组等间距创建辅助线
    equalSpacingsGroups.forEach(group => {
        for (let i = group.start; i < group.end; i++) {
            const startShape = allShapes[i];
            const endShape = allShapes[i+1];
            const startBounds = getShapeBounds(startShape);
            const endBounds = getShapeBounds(endShape);

            guides.push({
                orientation: 'horizontal',
                spacing: group.spacing,
                startShapeId: startShape.id,
                endShapeId: endShape.id,
                startX: startBounds.right,
                startY: startBounds.centerY,
                endX: endBounds.left,
                endY: endBounds.centerY,
            });
        }
    });
    
    return guides;
}

const  detectVerticalSpacing = (
    previewShape: CanvasShape,
    existingShapes: CanvasShape[]
): SpacingGuide[] => {
    const guides: SpacingGuide[] = [];
    const previewBounds = getShapeBounds(previewShape);

    // 1. 找出所有与预览图形centerX对齐的图形
    const alignedShapes = existingShapes.filter(shape => {
        const bounds = getShapeBounds(shape);
        return isApproximatelyEqual(
            bounds.centerX,
            previewBounds.centerX,
            CENTER_ALIGNMENT_TOLERANCE
        );
    });

    if (alignedShapes.length === 0) return guides;

    // 2.将所有图形按centerY排序
    const allShapes = [...alignedShapes, previewShape].sort((a, b) => {
        const aBounds = getShapeBounds(a);
        const bBounds = getShapeBounds(b);
        return aBounds.centerY - bBounds.centerY;
    });

    // 3. 找到预览图形在排序后的位置
    const previewIndex = allShapes.findIndex(s => s.id === previewShape.id);

    // 4. 从预览图形向上下扩展, 查找连续的等间距
    const spacings = calculateVerticalSpacings(allShapes);
    const equalSpacingsGroups = findEqualSpacingGroups(spacings, previewIndex);

    // 5. 为每组等间距创建距离辅助线
    equalSpacingsGroups.forEach(group => {
        for (let i = group.start; i < group.end; i++) {
            const startShape = allShapes[i];
            const endShape = allShapes[i + 1];
            const startBounds = getShapeBounds(startShape);
            const endBounds = getShapeBounds(endShape);

            guides.push({
                orientation: 'vertical',
                spacing: group.spacing,
                startShapeId: startShape.id,
                endShapeId: endShape.id,
                startX: startBounds.centerX,
                startY: startBounds.bottom,
                endX: endBounds.centerX,
                endY: endBounds.top,
            });
        }
    });

    return guides;
}

/**
 * 计算水平方向相邻图形之间的间距
 */
const calculateHorizontalSpacings = (sortedShapes: CanvasShape[]): number[] => {
    const spacings: number[] = [];

    for (let i = 0; i < sortedShapes.length - 1; i++) {
        const currentBounds = getShapeBounds(sortedShapes[i]);
        const nextBounds = getShapeBounds(sortedShapes[i+1]);
        const spacing = nextBounds.left - currentBounds.right;
        spacings.push(spacing);
    }

    return spacings;
};

/**
 * 计算垂直方向相邻图形之间的间距
 * @param sortedShapes 
 * @returns 
 */
const calculateVerticalSpacings = (sortedShapes: CanvasShape[]): number[] => {
    const spacings: number[] = [];

    for (let i = 0; i < sortedShapes.length - 1; i++) {
        const currentBounds = getShapeBounds(sortedShapes[i]);
        const nextBounds = getShapeBounds(sortedShapes[i + 1]);
        const spacing = nextBounds.top - currentBounds.bottom;
        spacings.push(spacing);
    }
    
    return spacings;
}

/**
 * 查找包含预览图形的连续等间距组
 * @param spacings 
 * @param previewIndex 
 * @returns 
 */
const findEqualSpacingGroups = (
    spacings: number[],
    previewIndex: number
): Array<{ start: number; end: number; spacing: number }> => {
    const groups: Array<{ start: number, end: number, spacing: number }> = [];
    
    if (spacings.length === 0) return groups;
    
    // 向左扩展: 从previewIndex - 1开始向左查找
    let leftStart = previewIndex - 1;
    const leftEnd = previewIndex - 1;

    if (leftStart >= 0) {
        const referenceSpacing = spacings[leftStart];
        // 继续向左查找相同间距
        while (
            leftStart > 0 &&
            isApproximatelyEqual(spacings[leftStart - 1], referenceSpacing, SPACING_TOLERANCE)
        ) {
            leftStart--;
        }

        // 如果找到至少两个连续间距, 添加到组中
        if (leftEnd - leftStart + 1 >= 1) {
            groups.push({
                start: leftStart,
                end: previewIndex,
                spacing: referenceSpacing,
            });
        }
    }

    // 向右扩展: 从previewIndex开始向右查找
    const rightStart = previewIndex;
    let rightEnd = previewIndex;

    if (rightStart < spacings.length) {
        const referenceSpacing = spacings[rightStart];

        // 继续向右查找相同间距
        while (
            rightEnd < spacings.length - 1 &&
            isApproximatelyEqual(spacings[rightEnd + 1], referenceSpacing, SPACING_TOLERANCE)
        ) {
            rightEnd++;
        }

        // 如果找到至少两个连续间距
        if (rightEnd - rightStart + 1 >= 1) {
            // 检查是否与左侧组重叠
            const isOverlapping = groups.some(
                g => g.spacing === referenceSpacing || isApproximatelyEqual(g.spacing, referenceSpacing, SPACING_TOLERANCE)
            );

            if (isOverlapping && groups.length > 0) {
                // 合并到左侧
                groups[0].end = rightEnd + 1;
            } else {
                groups.push({
                    start: rightStart,
                    end: rightEnd + 1,
                    spacing: referenceSpacing,
                });
            }
        }
    }

    // return groups;
    // 过滤掉只有一个间距
    return groups.filter(g => g.end - g.start >= 2);
};

/**
 * 绘制等间距辅助线
 * @param ctx 
 * @param guides 
 */
export const drawSpacingGuides = (
    ctx: CanvasRenderingContext2D,
    guides: SpacingGuide[]
) => {
    ctx.strokeStyle = '#FF6B00';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    guides.forEach(guide => {
        ctx.beginPath();
        ctx.moveTo(guide.startX, guide.startY);
        ctx.lineTo(guide.endX, guide.endY);
        ctx.stroke();
    });
};

export { SPACING_TOLERANCE, CENTER_ALIGNMENT_TOLERANCE };
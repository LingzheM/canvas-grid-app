import type { CanvasShape } from "../types/canvas";

// 检查点击位置是否在图形内部
export const isPointInShape = (
    x: number,
    y: number,
    shape: CanvasShape
): boolean => {
    if (shape.type === 'device') {
        // 矩形碰撞检测
        const halfWidth = shape.width / 2;
        const halfHeight = shape.height / 2;

        return (
            x >= shape.x - halfWidth &&
            x <= shape.x + halfWidth &&
            y >= shape.y - halfHeight &&
            y <= shape.y + halfHeight
        );
    } else if (shape.type === 'tool') {
        // 圆形碰撞检测
        const distance = Math.sqrt(
            Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2)
        );
        return distance <= shape.radius;
    }
    return false;
};

// 查找点击位置的图形
export const findShapeAtPoint = (
    x: number,
    y: number,
    shapes: CanvasShape[]
): CanvasShape | null => {
    for (let i = shapes.length - 1; i >= 0; i--) {
        if (isPointInShape(x, y, shapes[i])) {
            return shapes[i];
        }
    }
    return null;
}

// 限制图形位置在Canvas范围内
export const constrainShapePosition = (
    shape: CanvasShape,
    x: number,
    y: number,
    canvasWidth: number,
    canvasHeight: number
) : { x: number, y: number } => {
    let constrainedX = x;
    let constrainedY = y;

    if (shape.type === 'device') {
        const halfWidth = shape.width / 2;
        const halfHeight = shape.height / 2;

        // 限制在边界内
        constrainedX = Math.max(halfWidth, Math.min(canvasWidth - halfWidth, x));
        constrainedY = Math.max(halfHeight, Math.min(canvasHeight - halfHeight, y))
    } else if (shape.type === 'tool') {
        const radius = shape.radius;

        // 限制在边界内
        constrainedX = Math.max(radius, Math.min(canvasWidth - radius, x));
        constrainedY = Math.max(radius, Math.min(canvasHeight - radius, y))
    }
    return { x: constrainedX, y: constrainedY };
}

// 绘制选中框
export const drawSelectionBox = (
    ctx: CanvasRenderingContext2D,
    shape: CanvasShape
) => {
    ctx.strokeStyle = '#1a73e8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // 虚线

    if (shape.type === 'device' ) {
        const halfWidth = shape.width / 2;
        const halfHeight = shape.height / 2;
        const padding = 4;  // 选中框与图形的间距

        ctx.strokeRect(
            shape.x - halfWidth - padding,
            shape.y - halfHeight - padding,
            shape.width + padding * 2,
            shape.height + padding * 2
        )
    } else if (shape.type === 'tool') {
        const radius = shape.radius;
        const padding = 4; // 选中框与图形的间距

        ctx.beginPath();
        ctx.arc(
            shape.x,
            shape.y,
            radius + padding, 
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    ctx.setLineDash([]); // 重置为实线
}
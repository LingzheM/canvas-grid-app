import type { CanvasShape, Port, PortPosition } from "../types/canvas";

const PORT_RADUIS = 4; // 连接点半径4px

const PORT_CAPTURE_RADIUS = 15; // 连接点捕捉半径15px

// 计算图形的所有连接点位置

export const calculatePorts = (shape: CanvasShape): Port[] => {
    const ports: Port[] = [];

    if (shape.type === 'device') {
        // 设备: 矩形的上下左右中间
        const halfWidth = shape.width / 2;
        const halfHeight = shape.height / 2;
        
        ports.push(
            { shapeId: shape.id, position: 'top', x: shape.x, y: shape.y - halfHeight }, // 上
            { shapeId: shape.id, position: 'right', x: shape.x + halfWidth, y: shape.y }, // 右
            { shapeId: shape.id, position: 'bottom', x: shape.x, y: shape.y + halfHeight }, // 下
            { shapeId: shape.id, position: 'left', x: shape.x - halfWidth, y: shape.y } // 左
        );
    } else if (shape.type === 'tool') {
        // 工具: 0度,90度,180度,270度方向
        const radius = shape.radius;
        ports.push(
            { shapeId: shape.id, position: 'top', x: shape.x, y: shape.y - radius }, // 上
            { shapeId: shape.id, position: 'right', x: shape.x + radius, y: shape.y }, // 右
            { shapeId: shape.id, position: 'bottom', x: shape.x, y: shape.y + radius }, // 下
            { shapeId: shape.id, position: 'left', x: shape.x - radius, y: shape.y } // 左
        );
    }
        return ports;
};

// 查找距离给定坐标最近的连接点
export const findNearestPort = (
    x: number, 
    y: number, 
    shape: CanvasShape[]): Port | null => {

    let nearestPort: Port | null = null;
    let minDistance = PORT_CAPTURE_RADIUS; // 只在捕捉半径内查找
    
    for (const s of shape) {
        const ports = calculatePorts(s);
        for (const port of ports) {
            const distance = Math.sqrt((port.x - x) ** 2 + (port.y - y) ** 2);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPort = port;
            }
        }
    }
    return nearestPort;
};

// 获取指定图形的指定位置的连接点坐标
export const getPortCoordinates = (
    shape: CanvasShape, 
    position: PortPosition
): { x: number; y: number } | null => {
    const ports = calculatePorts(shape);
    const port = ports.find(p => p.position === position);
    return port ? {x: port.x, y: port.y} : { x: shape.x, y: shape.y}; 
};

// 绘制连接点

export const drawPort = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
) => {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#999999  ';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, PORT_RADUIS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

// 绘制箭头

export const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
) => {
    const arrowLength = 10; // 箭头长度

    // 计算箭头角度
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // 箭头的顶点
    const arrowPoint1x = toX - arrowLength * Math.cos(angle - Math.PI / 6);
    const arrowPoint1y = toY - arrowLength * Math.sin(angle - Math.PI / 6);
    const arrowPoint2x = toX - arrowLength * Math.cos(angle + Math.PI / 6);
    const arrowPoint2y = toY - arrowLength * Math.sin(angle + Math.PI / 6);

    // 绘制箭头
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(arrowPoint1x, arrowPoint1y);
    ctx.lineTo(arrowPoint2x, arrowPoint2y);
    ctx.closePath();
    ctx.fill();
};

export {PORT_RADUIS, PORT_CAPTURE_RADIUS};
    

import { useEffect, useRef } from 'react';
import styles from './Canvas.module.css';
import type { CanvasShape, Connection } from '../../types/canvas';
import { useConnectionTool } from './hooks/useConnectionTool';
import {
  calculatePorts,
  drawPort,
  drawArrow,
  getPortCoordinates,
} from '../../utils/connectionUtils';

const GRID_SIZE = 50; // 网格间距50px
const GRID_COLOR = '#e0e0e0'; // 浅灰色

interface CanvasProps {
  shapes: CanvasShape[];
  connections: Connection[];
  isConnectionToolActive: boolean;
  onCanvasClick: (x: number, y: number) => void;
  onConnectionCreate: (connection: Connection) => void;
}

const Canvas = ({
  shapes,
  connections,
  isConnectionToolActive,
  onCanvasClick,
  onConnectionCreate,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用连接线工具Hook
  const {
    connectionToolState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setCanvasRef,
  } = useConnectionTool({
    isConnectionToolActive,
    shapes,
    onConnectionCreate,
  });

  // 绘制网格线的函数
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();

    // 绘制垂直线
    for (let x = 0; x <= width; x += GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    // 绘制水平线
    for (let y = 0; y <= height; y += GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  };

  // 绘制连接线
  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    connections.forEach((connection) => {
      const fromShape = shapes.find(s => s.id === connection.fromShapeId);
      const toShape = shapes.find(s => s.id === connection.toShapeId);

      if (!fromShape || !toShape) return;

      const fromPoint = getPortCoordinates(fromShape, connection.fromPort);
      const toPoint = getPortCoordinates(toShape, connection.toPort);

      // 绘制连接线
      ctx.strokeStyle = connection.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromPoint.x, fromPoint.y);
      ctx.lineTo(toPoint.x, toPoint.y);
      ctx.stroke();

      // 绘制箭头
      drawArrow(ctx, fromPoint.x, fromPoint.y, toPoint.x, toPoint.y, connection.color);
    });
  };

  // 绘制预览线
  const drawPreviewLine = (ctx: CanvasRenderingContext2D) => {
    if (!connectionToolState.startPort || !connectionToolState.previewEndPoint) return;

    const { startPort, previewEndPoint } = connectionToolState;

    ctx.strokeStyle = 'rgba(251, 188, 4, 0.6)'; // 半透明黄色
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // 虚线
    ctx.beginPath();
    ctx.moveTo(startPort.x, startPort.y);
    ctx.lineTo(previewEndPoint.x, previewEndPoint.y);
    ctx.stroke();
    ctx.setLineDash([]); // 重置为实线
  };

  // 绘制图形的函数
  const drawShapes = (ctx: CanvasRenderingContext2D) => {
    shapes.forEach((shape) => {
      ctx.fillStyle = shape.color;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;

      if (shape.type === 'device') {
        // 绘制圆角矩形 (120x80)
        const width = 120;
        const height = 80;
        const x = shape.x - width / 2;
        const y = shape.y - height / 2;
        const radius = 8;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 绘制文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shape.label, shape.x, shape.y);
      } else if (shape.type === 'tool') {
        // 绘制圆形 (直径100px, 半径50px)
        const radius = 50;

        ctx.beginPath();
        ctx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shape.label, shape.x, shape.y);
      }
    });
  };

  // 绘制连接点
  const drawConnectionPorts = (ctx: CanvasRenderingContext2D) => {
    if (!isConnectionToolActive) return;

    shapes.forEach((shape) => {
      const ports = calculatePorts(shape);
      ports.forEach((port) => {
        drawPort(ctx, port.x, port.y);
      });
    });
  };

  // 调整canvas尺寸并重绘
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 获取容器的实际尺寸
    const { width, height } = container.getBoundingClientRect();

    // 设置canvas的实际像素尺寸(考虑设备像素比)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // 设置canvas的显示尺寸
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // 缩放绘图上下文以匹配设备像素比(保证清晰度)
    ctx.scale(dpr, dpr);

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制顺序很重要
    drawGrid(ctx, width, height);
    drawConnections(ctx); // 先绘制连接线(在图形下方)
    drawShapes(ctx);
    drawPreviewLine(ctx); // 预览线在最上层
    drawConnectionPorts(ctx); // 连接点在最上层
  };

  // 处理Canvas点击事件
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 如果是连接线工具,不触发普通点击
    if (isConnectionToolActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onCanvasClick(x, y);
  };

  useEffect(() => {
    // 设置canvas引用给hook
    if (canvasRef.current) {
      setCanvasRef(canvasRef.current);
    }

    // 初始化绘制
    resizeCanvas();

    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);

    // 清理事件监听
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 当shapes、connections或connectionToolState变化时重绘
  useEffect(() => {
    resizeCanvas();
  }, [shapes, connections, isConnectionToolActive, connectionToolState]);

  return (
    <div ref={containerRef} className={styles.canvasContainer}>
      <canvas 
        ref={canvasRef} 
        className={styles.canvas}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default Canvas;
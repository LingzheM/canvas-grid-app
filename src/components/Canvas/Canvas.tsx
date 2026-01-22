import { useEffect, useRef } from "react";
import styles from './Canvas.module.css';

// 网格线, 颜色
const GRID_SIZE = 20;
const GRID_COLOR = '#e0e0e0';

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 绘制网格线
    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

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
    
    // 调整画布大小
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 获得实际尺寸
        const { width, height } = container.getBoundingClientRect();

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // 缩放绘图上下文
        ctx.scale(dpr, dpr);

        // 绘制网格
        drawGrid(ctx, width, height);
    };

    useEffect(() => {
        resizeCanvas();
        
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        }
    }, []);

    return (
        <div ref={containerRef} className={styles.canvasContainer}>
            <canvas ref={canvasRef} className={styles.canvas} />
        </div>
    );
};

export default Canvas;
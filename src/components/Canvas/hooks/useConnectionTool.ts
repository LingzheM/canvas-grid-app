import React, { useState, useCallback, useRef } from "react";
import type { CanvasShape, Port, Connection } from "../../../types/canvas";
import { findNearestPort } from "../../../utils/connectionUtils";


interface UseConnectionToolProps {
    isConnectionToolActive: boolean;
    shapes: CanvasShape[];
    onConnectionCreate: (connection: Connection) => void;
}

interface ConnectionToolState {
    startPort: Port | null;
    previewEndPoint: { x: number; y: number } | null;
    isDragging: boolean;
}

export const useConnectionTool = ({
    isConnectionToolActive,
    shapes,
    onConnectionCreate
}: UseConnectionToolProps) => {
    const [state, setState] = useState<ConnectionToolState>({
        startPort: null,
        previewEndPoint: null,
        isDragging: false,
    });

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // 处理鼠标按下——选择起点
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!isConnectionToolActive) return;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const port = findNearestPort(x, y, shapes);
            if (port) {
                setState({
                    startPort: port,
                    previewEndPoint: { x: port.x, y: port.y },
                    isDragging: true,
                });
            }        
        }
        , [isConnectionToolActive, shapes]
    );
    
    // 处理鼠标移动——更新预览终点
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isConnectionToolActive || !state.isDragging || !state.startPort) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setState(prev => ({
            ...prev,
            previewEndPoint: { x, y }
        }));
    }, [isConnectionToolActive, state.isDragging, state.startPort])
    ;
       
    // 处理鼠标释放——确定终点并创建连接
    const handleMouseUp = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isConnectionToolActive || !state.isDragging || !state.startPort) {
            setState({
                startPort: null,
                previewEndPoint: null,
                isDragging: false,
            });
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const endPort = findNearestPort(x, y, shapes);

        // 验证终点
        if (endPort && endPort.shapeId !== state.startPort.shapeId) {
            // 不允许连接自己
            const newConnection: Connection = {
                id: `conn-${Date.now()}`,
                fromShapeId: state.startPort.shapeId,
                fromPort: state.startPort.position,
                toShapeId: endPort.shapeId,
                toPort: endPort.position,
                color: '#000000', // 默认颜色
            };
            onConnectionCreate(newConnection);
        }

        // 重置状态
        setState({
            startPort: null,
            previewEndPoint: null,
            isDragging: false,
        });
    }, [isConnectionToolActive, state.isDragging, state.startPort, shapes, onConnectionCreate]
    );
    
    const setCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
        canvasRef.current = node;
    }, []);

    return {
        canvasRef,
        setCanvasRef,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        connectionToolState: state,
    };
}
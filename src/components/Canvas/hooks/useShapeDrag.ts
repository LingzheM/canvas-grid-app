import { useState, useCallback, useRef, useEffect } from 'react';
import type { CanvasShape, DragState, AlignmentGuide } from '../../../types/canvas';
import { findShapeAtPoint, constrainShapePosition } from '../../../utils/shapeUtils';
import { findNearestPort } from '../../../utils/connectionUtils';
import { detectAlignments, applySnapping } from '../../../utils/alignmentUtils';

interface UseShapeDragProps {
  shapes: CanvasShape[];
  isAnyToolActive: boolean;
  isConnectionToolActive: boolean;
  onShapeMove: (shapeId: string, x: number, y: number) => void;
}

export const useShapeDrag = ({
  shapes,
  isAnyToolActive,
  onShapeMove,
}: UseShapeDragProps) => {
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    shapeId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    previewX: 0,
    previewY: 0,
  });
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  // 设置Canvas引用和尺寸
  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvasSizeRef.current = { width: rect.width, height: rect.height };
    }
  }, []);

  // 更新Canvas尺寸
  const updateCanvasSize = useCallback((width: number, height: number) => {
    canvasSizeRef.current = { width, height };
  }, []);

  // 处理鼠标按下 - 选中和开始拖拽
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // 如果有工具选中,不允许拖拽
      if (isAnyToolActive) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 查找点击的图形
      const clickedShape = findShapeAtPoint(x, y, shapes);

      if (clickedShape) {
        // 检查是否点击了连接点(15px范围)
        const nearestPort = findNearestPort(x, y, shapes);
        
        // 如果点击的是连接点,不触发拖拽
        if (nearestPort && nearestPort.shapeId === clickedShape.id) {
          return;
        }

        // 选中图形
        setSelectedShapeId(clickedShape.id);

        // 开始拖拽
        setDragState({
          isDragging: true,
          shapeId: clickedShape.id,
          startX: x,
          startY: y,
          offsetX: x - clickedShape.x,
          offsetY: y - clickedShape.y,
          previewX: clickedShape.x,
          previewY: clickedShape.y,
        });
      } else {
        // 点击空白区域,取消选中
        setSelectedShapeId(null);
      }
    },
    [shapes, isAnyToolActive]
  );

  // 处理鼠标移动 - 更新拖拽预览
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragState.isDragging || !dragState.shapeId) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 计算新位置
      const newX = x - dragState.offsetX;
      const newY = y - dragState.offsetY;

      // 获取被拖拽的图形
      const shape = shapes.find(s => s.id === dragState.shapeId);
      if (!shape) return;

      // 创建预览图形对象
      const previewShape: CanvasShape = {
        ...shape,
        x: newX,
        y: newY,
      };

      // 检测对齐
      const guides = detectAlignments(previewShape, shapes, dragState.shapeId);

      // 应用吸附
      const snappedPos = applySnapping(previewShape, guides);

      // 应用边界限制
      const { width, height } = canvasSizeRef.current;
      const constrainedPos = constrainShapePosition(shape, snappedPos.x, snappedPos.y, width, height);

      // 更新预览位置和对齐线
      setDragState(prev => ({
        ...prev,
        previewX: constrainedPos.x,
        previewY: constrainedPos.y,
      }));

      setAlignmentGuides(guides);
    },
    [dragState.isDragging, dragState.shapeId, dragState.offsetX, dragState.offsetY, shapes]
  );

  // 处理鼠标释放 - 完成拖拽
  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.shapeId) return;

    // 应用最终位置
    onShapeMove(dragState.shapeId, dragState.previewX, dragState.previewY);

    // 重置拖拽状态和对齐线
    setDragState({
      isDragging: false,
      shapeId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      previewX: 0,
      previewY: 0,
    });
    setAlignmentGuides([]);
  }, [dragState, onShapeMove]);

  // 添加全局mouseup监听,防止鼠标移出canvas后释放
  useEffect(() => {
    if (dragState.isDragging) {
      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };

      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseUp]);

  return {
    selectedShapeId,
    dragState,
    alignmentGuides,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setCanvasRef,
    updateCanvasSize,
  };
};
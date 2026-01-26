import { useState, useCallback, useRef } from 'react';
import type { CanvasShape, CreationPreviewState, AlignmentGuide } from '../../../types/canvas';
import { detectAlignments, applySnapping } from '../../../utils/alignmentUtils';

interface UseShapeCreationProps {
  shapes: CanvasShape[];
  selectedToolType: 'device' | 'tool' | null;
  selectedToolColor: string;
  selectedToolLabel: string;
}

export const useShapeCreation = ({
  shapes,
  selectedToolType,
  selectedToolColor,
  selectedToolLabel,
}: UseShapeCreationProps) => {
  const [previewState, setPreviewState] = useState<CreationPreviewState>({
    isActive: false,
    x: 0,
    y: 0,
    toolType: null,
    color: '',
    label: '',
  });

  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 设置Canvas引用
  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  // 处理鼠标移动 - 更新预览位置和对齐线
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!selectedToolType) {
        setPreviewState(prev => ({ ...prev, isActive: false }));
        setAlignmentGuides([]);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 创建临时预览图形对象
      const previewShape: CanvasShape = {
        id: 'preview',
        type: selectedToolType,
        x,
        y,
        color: selectedToolColor,
        label: selectedToolLabel,
        ...(selectedToolType === 'device'
          ? { width: 120, height: 80 }
          : { radius: 50 }),
      } as CanvasShape;

      // 检测对齐
      const guides = detectAlignments(previewShape, shapes);
      
      // 应用吸附
      const snappedPos = applySnapping(previewShape, guides);

      setPreviewState({
        isActive: true,
        x: snappedPos.x,
        y: snappedPos.y,
        toolType: selectedToolType,
        color: selectedToolColor,
        label: selectedToolLabel,
      });

      setAlignmentGuides(guides);
    },
    [selectedToolType, selectedToolColor, selectedToolLabel, shapes]
  );

  // 处理鼠标离开Canvas
  const handleMouseLeave = useCallback(() => {
    setPreviewState(prev => ({ ...prev, isActive: false }));
    setAlignmentGuides([]);
  }, []);

  // 获取最终的放置坐标(带吸附)
  const getFinalPosition = (): { x: number; y: number } => {
    return { x: previewState.x, y: previewState.y };
  };

  return {
    previewState,
    alignmentGuides,
    handleMouseMove,
    handleMouseLeave,
    getFinalPosition,
    setCanvasRef,
  };
};
import { useState, useEffect } from 'react';
import Canvas from '../Canvas/Canvas';
import Toolbar, { TOOL_ITEMS } from '../Toolbar/Toolbar';
import styles from './CanvasWorkspace.module.css';
import type { CanvasShape } from '../../types/canvas';

const STORAGE_KEY = 'canvas-shapes';

// 从localStorage加载初始数据的函数
const loadInitialShapes = (): CanvasShape[] => {
  const savedShapes = localStorage.getItem(STORAGE_KEY);
  if (savedShapes) {
    try {
      return JSON.parse(savedShapes);
    } catch (error) {
      console.error('Failed to load shapes from localStorage:', error);
      return [];
    }
  }
  return [];
};

const CanvasWorkspace = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  // 使用lazy initialization从localStorage加载初始数据
  const [shapes, setShapes] = useState<CanvasShape[]>(loadInitialShapes);

  // 保存图形数据到localStorage (只在shapes变化时执行)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
  }, [shapes]);

  // 处理Canvas点击事件
  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedTool) return;

    // 查找选中的工具信息
    const tool = TOOL_ITEMS.find(item => item.id === selectedTool);
    if (!tool) return;

    // 跳过连接线工具
    if (tool.type === 'connection') {
      console.log('连接线功能将在后续Phase实现');
      setSelectedTool(null);
      return;
    }

    // 创建新图形
    const newShape: CanvasShape = {
      id: `${tool.type}-${Date.now()}`,
      type: tool.type as 'device' | 'tool',
      x,
      y,
      color: tool.color,
      label: tool.label,
      ...(tool.type === 'device' 
        ? { width: 120, height: 80 } 
        : { radius: 50 }
      ),
    } as CanvasShape;

    setShapes(prev => [...prev, newShape]);
    
    // 创建图形后自动取消工具选中
    setSelectedTool(null);
  };

  return (
    <div className={styles.workspace}>
      <Toolbar 
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
      />
      <div className={styles.canvasArea}>
        <Canvas 
          shapes={shapes}
          onCanvasClick={handleCanvasClick}
        />
      </div>
    </div>
  );
};

export default CanvasWorkspace;
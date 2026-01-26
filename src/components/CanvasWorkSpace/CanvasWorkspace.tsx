import { useState, useEffect } from 'react';
import Canvas from '../Canvas/Canvas';
import Toolbar, { TOOL_ITEMS } from '../Toolbar/Toolbar';
import styles from './CanvasWorkspace.module.css';
import type { CanvasShape, Connection } from '../../types/canvas';

const SHAPES_STORAGE_KEY = 'canvas-shapes';
const CONNECTIONS_STORAGE_KEY = 'canvas-connections';

// 从localStorage加载初始图形数据的函数
const loadInitialShapes = (): CanvasShape[] => {
  const savedShapes = localStorage.getItem(SHAPES_STORAGE_KEY);
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

// 从localStorage加载初始连接线数据的函数
const loadInitialConnections = (): Connection[] => {
  const savedConnections = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
  if (savedConnections) {
    try {
      return JSON.parse(savedConnections);
    } catch (error) {
      console.error('Failed to load connections from localStorage:', error);
      return [];
    }
  }
  return [];
};

const CanvasWorkspace = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  // 使用lazy initialization从localStorage加载初始数据
  const [shapes, setShapes] = useState<CanvasShape[]>(loadInitialShapes);
  const [connections, setConnections] = useState<Connection[]>(loadInitialConnections);

  // 保存图形数据到localStorage
  useEffect(() => {
    localStorage.setItem(SHAPES_STORAGE_KEY, JSON.stringify(shapes));
  }, [shapes]);

  // 保存连接线数据到localStorage
  useEffect(() => {
    localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
  }, [connections]);

  // 处理Canvas点击事件 - 创建图形
  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedTool) return;

    // 查找选中的工具信息
    const tool = TOOL_ITEMS.find(item => item.id === selectedTool);
    if (!tool) return;

    // 跳过连接线工具(由拖拽处理)
    if (tool.type === 'connection') {
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

  // 处理连接线创建
  const handleConnectionCreate = (connection: Connection) => {
    setConnections(prev => [...prev, connection]);
    // 创建连接线后自动取消工具选中
    setSelectedTool(null);
  };

  // 处理图形移动
  const handleShapeMove = (shapeId: string, x: number, y: number) => {
    const updatedShapes = shapes.map(shape =>
      shape.id === shapeId ? { ...shape, x, y } : shape
    );
    setShapes(updatedShapes);
  };

  // 判断是否是连接线工具
  const isConnectionToolActive = selectedTool === 'connection-1';
  // 判断是否有任何工具被激活
  const isAnyToolActive = selectedTool !== null;

  const selectedToolInfo = selectedTool ? TOOL_ITEMS.find(item => item.id === selectedTool) : null;
  const selectedToolType = selectedToolInfo && selectedToolInfo.type !== 'connection' ? (selectedToolInfo.type as 'device' | 'tool') : null;
  const selectedToolColor = selectedToolInfo?.color || '';
  const selectedToolLabel = selectedToolInfo?.label || '';

  return (
    <div className={styles.workspace}>
      <Toolbar 
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
      />
      <div className={styles.canvasArea}>
        <Canvas 
          shapes={shapes}
          connections={connections}
          isConnectionToolActive={isConnectionToolActive}
          isAnyToolActive={isAnyToolActive}
          selectedToolType={selectedToolType}
          selectedToolColor={selectedToolColor}
          selectedToolLabel={selectedToolLabel}
          onCanvasClick={handleCanvasClick}
          onConnectionCreate={handleConnectionCreate}
          onShapeMove={handleShapeMove}
        />
      </div>
    </div>
  );
};

export default CanvasWorkspace;
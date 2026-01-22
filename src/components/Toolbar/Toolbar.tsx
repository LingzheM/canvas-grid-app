import { useEffect } from 'react';
import styles from './Toolbar.module.css';

type ToolType = 'device' | 'tool' | 'connection';

interface ToolItem {
  id: string;
  type: ToolType;
  label: string;
  color: string;
}

const TOOL_ITEMS: ToolItem[] = [
  { id: 'device-1', type: 'device', label: '设备', color: '#4285f4' },
  { id: 'tool-1', type: 'tool', label: '工具', color: '#34a853' },
  { id: 'connection-1', type: 'connection', label: '连接线', color: '#fbbc04' },
];

interface ToolbarProps {
  selectedTool: string | null;
  onToolSelect: (toolId: string | null) => void;
}

const Toolbar = ({ selectedTool, onToolSelect }: ToolbarProps) => {
  const handleToolClick = (toolId: string) => {
    // 如果点击已选中的工具,取消选中
    if (selectedTool === toolId) {
      onToolSelect(null);
    } else {
      onToolSelect(toolId);
    }
  };

  // 监听ESC键取消工具选中
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTool) {
        onToolSelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, onToolSelect]);

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolList}>
        {TOOL_ITEMS.map((tool) => (
          <div
            key={tool.id}
            className={`${styles.toolItem} ${
              selectedTool === tool.id ? styles.toolItemActive : ''
            }`}
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
          >
            <div
              className={styles.toolIcon}
              style={{ backgroundColor: tool.color }}
            />
            <span className={styles.toolLabel}>{tool.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;

// 导出工具项数据,供其他组件使用
export { TOOL_ITEMS };
export type { ToolItem };
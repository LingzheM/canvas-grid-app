import { useState } from 'react';
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

const Toolbar = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);
    console.log('Selected tool:', toolId);
  };

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
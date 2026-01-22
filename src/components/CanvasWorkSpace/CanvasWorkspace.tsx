import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar';
import styles from './CanvasWorkspace.module.css';

const CanvasWorkspace = () => {
    return (
        <div className={styles.workspace}>
            <Toolbar />
            <div className={styles.canvasArea}>
                <Canvas />
            </div>
        </div>
    );
};

export default CanvasWorkspace;
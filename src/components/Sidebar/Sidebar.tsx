import styles from  './Sidebar.module.css';

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <h2>Canvas App</h2>
            </div>

            <nav className={styles.nav}>
                <div className={styles.navItem}>
                    <span className={styles.navIcon}>🏠</span>
                    <span>画布1</span>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
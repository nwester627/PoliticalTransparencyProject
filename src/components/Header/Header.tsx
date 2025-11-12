import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>Political Project</h1>
        <nav className={styles.nav}>
          <a href="#home" className={styles.navLink}>
            Home
          </a>
          <a href="#about" className={styles.navLink}>
            About
          </a>
          <a href="#contact" className={styles.navLink}>
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

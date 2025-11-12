import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to Political Project</h1>
        <p className={styles.description}>
          A platform dedicated to fostering civic engagement and informed
          political discourse.
        </p>
        <div className={styles.actions}>
          <button className={styles.primaryButton}>Get Started</button>
          <button className={styles.secondaryButton}>Learn More</button>
        </div>
      </div>
    </section>
  );
}

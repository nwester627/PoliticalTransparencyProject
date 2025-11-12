import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>Political Transparency Project</h1>
        <p className={styles.description}>
          Track congressional members, voting records, campaign donations, and
          legislation—all in one transparent platform. Stay informed with
          breaking political news and comprehensive data analysis.
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>📊 Member Profiles</div>
          <div className={styles.feature}>🗳️ Voting Records</div>
          <div className={styles.feature}>💰 Campaign Finance</div>
          <div className={styles.feature}>📜 Bill Tracking</div>
        </div>
        <div className={styles.actions}>
          <Link href="/members" className={styles.primaryButton}>
            Explore Members
          </Link>
          <Link href="/breaking-news" className={styles.secondaryButton}>
            Breaking News
          </Link>
        </div>
      </div>
    </section>
  );
}

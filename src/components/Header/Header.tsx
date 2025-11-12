import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <h1>Political Transparency Project</h1>
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/members" className={styles.navLink}>
            Members
          </Link>
          <Link href="/voting-records" className={styles.navLink}>
            Voting Records
          </Link>
          <Link href="/donations" className={styles.navLink}>
            Donations
          </Link>
          <Link href="/bills" className={styles.navLink}>
            Bills
          </Link>
          <Link href="/breaking-news" className={styles.navLink}>
            Breaking News
          </Link>
        </nav>
      </div>
    </header>
  );
}

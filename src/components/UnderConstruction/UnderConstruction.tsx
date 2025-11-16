import Link from "next/link";
import styles from "./UnderConstruction.module.css";

type Props = {
  title?: string;
  message?: string;
};

export default function UnderConstruction({
  title = "Coming Soon",
  message = "This section is under construction. We'll restore full features soon.",
}: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden>
          🛠️
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

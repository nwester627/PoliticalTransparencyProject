import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  value: number;
  label?: string;
  variant?: "default" | "democrat" | "republican" | "independent";
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  variant = "default",
  showPercentage = true,
  className = "",
}: ProgressBarProps) {
  return (
    <div className={`${styles.progressBarContainer} ${className}`}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.progressBar}>
        <div
          className={`${styles.progress} ${styles[variant]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        >
          {showPercentage && `${value}%`}
        </div>
      </div>
    </div>
  );
}

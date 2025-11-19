import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: string;
  backgroundImage?: string;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  icon,
  backgroundImage,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`${styles.pageHeader} ${
        backgroundImage ? styles.hasBackground : ""
      } ${className}`}
      style={
        backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}
      }
    >
      <h1 className={styles.pageTitle}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {title}
      </h1>
      <p className={styles.pageDescription}>{description}</p>
    </div>
  );
}

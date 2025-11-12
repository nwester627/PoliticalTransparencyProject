import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: string;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  icon,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`${styles.pageHeader} ${className}`}>
      <h1 className={styles.pageTitle}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {title}
      </h1>
      <p className={styles.pageDescription}>{description}</p>
    </div>
  );
}

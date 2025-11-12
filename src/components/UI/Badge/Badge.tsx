import styles from "./Badge.module.css";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "status" | "tag" | "party" | "impact";
  type?: string;
  className?: string;
}

export default function Badge({
  children,
  variant = "tag",
  type = "",
  className = "",
}: BadgeProps) {
  const variantClass = type
    ? styles[type.toLowerCase().replace(/\s+/g, "")]
    : "";

  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
}

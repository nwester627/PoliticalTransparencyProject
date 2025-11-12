import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  hover?: boolean;
  className?: string;
}

export default function Card({
  children,
  variant = "default",
  hover = false,
  className = "",
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${
        hover ? styles.hover : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

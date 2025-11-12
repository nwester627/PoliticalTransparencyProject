"use client";

import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "action";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  fullWidth = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]} ${
        fullWidth ? styles.fullWidth : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

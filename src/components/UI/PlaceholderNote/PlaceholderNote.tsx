import styles from "./PlaceholderNote.module.css";

interface PlaceholderNoteProps {
  children: React.ReactNode;
  className?: string;
}

export default function PlaceholderNote({
  children,
  className = "",
}: PlaceholderNoteProps) {
  return (
    <div className={`${styles.placeholderNote} ${className}`}>{children}</div>
  );
}

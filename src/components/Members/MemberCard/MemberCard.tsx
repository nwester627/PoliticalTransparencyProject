import Card from "@/components/UI/Card/Card";
import Button from "@/components/UI/Button/Button";
import styles from "./MemberCard.module.css";

interface MemberCardProps {
  name: string;
  party: string;
  state: string;
  committees?: number;
  bills?: number;
  onViewProfile?: () => void;
}

export default function MemberCard({
  name,
  party,
  state,
  committees = 0,
  bills = 0,
  onViewProfile,
}: MemberCardProps) {
  return (
    <Card hover className={styles.memberCard}>
      <div className={styles.photoPlaceholder}>
        <span className={styles.photoIcon}>👤</span>
      </div>
      <div className={styles.memberInfo}>
        <h3 className={styles.memberName}>{name}</h3>
        <p className={styles.memberDetails}>
          {party} - {state}
        </p>
        <div className={styles.memberStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Committees:</span>
            <span className={styles.statValue}>{committees}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Bills:</span>
            <span className={styles.statValue}>{bills}</span>
          </div>
        </div>
        <Button fullWidth onClick={onViewProfile}>
          View Full Profile
        </Button>
      </div>
    </Card>
  );
}

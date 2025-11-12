import Card from "@/components/UI/Card/Card";
import Badge from "@/components/UI/Badge/Badge";
import Button from "@/components/UI/Button/Button";
import styles from "./BillCard.module.css";

interface BillCardProps {
  number: string;
  title: string;
  sponsor: string;
  status: string;
  introduced: string;
  lastAction: string;
  subjects: string[];
  appropriation?: string;
  onViewText?: () => void;
  onViewVoting?: () => void;
  onViewDocuments?: () => void;
}

export default function BillCard({
  number,
  title,
  sponsor,
  status,
  introduced,
  lastAction,
  subjects,
  appropriation,
  onViewText,
  onViewVoting,
  onViewDocuments,
}: BillCardProps) {
  return (
    <Card hover className={styles.billCard}>
      <div className={styles.billHeader}>
        <div className={styles.billTitleSection}>
          <span className={styles.billNumber}>{number}</span>
          <Badge variant="status" type={status}>
            {status}
          </Badge>
        </div>
        {appropriation && (
          <div className={styles.appropriation}>
            <span className={styles.appropriationLabel}>Appropriation:</span>
            <span className={styles.appropriationAmount}>{appropriation}</span>
          </div>
        )}
      </div>

      <h3 className={styles.billTitle}>{title}</h3>

      <div className={styles.billMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Sponsor:</span>
          <span className={styles.metaValue}>{sponsor}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Introduced:</span>
          <span className={styles.metaValue}>{introduced}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Last Action:</span>
          <span className={styles.metaValue}>{lastAction}</span>
        </div>
      </div>

      <div className={styles.subjects}>
        {subjects.map((subject, index) => (
          <Badge key={index} variant="tag">
            {subject}
          </Badge>
        ))}
      </div>

      <div className={styles.billActions}>
        <Button variant="action" onClick={onViewText}>
          View Full Text
        </Button>
        <Button variant="action" onClick={onViewVoting}>
          Voting History
        </Button>
        <Button variant="action" onClick={onViewDocuments}>
          Related Documents
        </Button>
      </div>
    </Card>
  );
}

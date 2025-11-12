import Card from "@/components/UI/Card/Card";
import Badge from "@/components/UI/Badge/Badge";
import Button from "@/components/UI/Button/Button";
import ProgressBar from "@/components/UI/ProgressBar/ProgressBar";
import styles from "./VoteCard.module.css";

interface VoteCardProps {
  bill: string;
  title: string;
  date: string;
  result: string;
  yesVotes: number;
  noVotes: number;
  partyAlignment: {
    D: number;
    R: number;
    I: number;
  };
  onViewDetails?: () => void;
}

export default function VoteCard({
  bill,
  title,
  date,
  result,
  yesVotes,
  noVotes,
  partyAlignment,
  onViewDetails,
}: VoteCardProps) {
  return (
    <Card className={styles.voteCard}>
      <div className={styles.voteHeader}>
        <div>
          <span className={styles.billNumber}>{bill}</span>
          <Badge variant="status" type={result}>
            {result}
          </Badge>
        </div>
        <span className={styles.voteDate}>{date}</span>
      </div>

      <h3 className={styles.voteTitle}>{title}</h3>

      <div className={styles.voteStats}>
        <div className={styles.voteCounts}>
          <div className={styles.yesCount}>
            <span className={styles.countLabel}>Yes</span>
            <span className={styles.countValue}>{yesVotes}</span>
          </div>
          <div className={styles.noCount}>
            <span className={styles.countLabel}>No</span>
            <span className={styles.countValue}>{noVotes}</span>
          </div>
        </div>

        <div className={styles.partyAlignment}>
          <h4>Party Alignment (% Yes)</h4>
          <div className={styles.alignmentBars}>
            <ProgressBar
              value={partyAlignment.D}
              label="Democrats"
              variant="democrat"
            />
            <ProgressBar
              value={partyAlignment.R}
              label="Republicans"
              variant="republican"
            />
            <ProgressBar
              value={partyAlignment.I}
              label="Independent"
              variant="independent"
            />
          </div>
        </div>
      </div>

      <Button fullWidth variant="action" onClick={onViewDetails}>
        View Full Roll Call & Member Votes
      </Button>
    </Card>
  );
}

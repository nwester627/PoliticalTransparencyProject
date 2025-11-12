"use client";

import styles from "./ExecutiveBranch.module.css";

export default function ExecutiveBranch() {
  return (
    <div className={styles.executiveView}>
      <div className={styles.executiveCard}>
        <div className={styles.executiveImageWrapper}>
          <img
            src="/assets/Trump-portrait-scaled.jpg"
            alt="President Donald J. Trump"
            className={styles.executiveImage}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              // Fallback to Wikimedia if local image fails
              if (!e.currentTarget.src.includes("wikimedia")) {
                e.currentTarget.src =
                  "https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg";
              } else {
                e.currentTarget.src = "/images/portrait-placeholder.svg";
              }
            }}
          />
        </div>
        <div className={styles.executiveInfo}>
          <h3>Donald J. Trump</h3>
          <p className={styles.executiveTitle}>
            President of the United States
          </p>
          <p className={styles.executiveParty}>Republican</p>
          <p className={styles.executiveTerm}>Inaugurated: January 20, 2025</p>
        </div>
      </div>

      <div className={styles.executiveCard}>
        <div className={styles.executiveImageWrapper}>
          <img
            src="/assets/January_2025_Official_Vice_Presidential_Portrait_of_JD_Vance.jpg"
            alt="Vice President J.D. Vance"
            className={styles.executiveImage}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              // Fallback to Wikimedia if local image fails
              if (!e.currentTarget.src.includes("wikimedia")) {
                e.currentTarget.src =
                  "https://upload.wikimedia.org/wikipedia/commons/9/99/JD_Vance_official_portrait%2C_118th_Congress_%28cropped%29.jpg";
              } else {
                e.currentTarget.src = "/images/portrait-placeholder.svg";
              }
            }}
          />
        </div>
        <div className={styles.executiveInfo}>
          <h3>J.D. Vance</h3>
          <p className={styles.executiveTitle}>
            Vice President of the United States
          </p>
          <p className={styles.executiveParty}>Republican</p>
          <p className={styles.executiveTerm}>Inaugurated: January 20, 2025</p>
        </div>
      </div>
    </div>
  );
}

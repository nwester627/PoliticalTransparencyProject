"use client";

import { SUPREME_COURT_JUSTICES } from "@/utils/supremeCourtData";
import styles from "./JudicialBranch.module.css";

export default function JudicialBranch({ breakdown }) {
  return (
    <div className={styles.judicialView}>
      <div className={styles.branchHeader}>
        <h3>U.S. Supreme Court</h3>
        <div className={styles.courtBreakdown}>
          <span style={{ color: "#DC143C", fontWeight: "bold" }}>
            {breakdown.republicans} Republican
          </span>
          {" - "}
          <span style={{ color: "#1E90FF", fontWeight: "bold" }}>
            {breakdown.democrats} Democrat
          </span>
        </div>
      </div>
      <div className={styles.justicesGrid}>
        {SUPREME_COURT_JUSTICES.map((justice, index) => (
          <div key={index} className={styles.justiceCard}>
            <div className={styles.justiceImageWrapper}>
              <img
                src={justice.imageUrl}
                alt={justice.name}
                className={styles.justiceImage}
              />
            </div>
            <div className={styles.justiceInfo}>
              <h4>{justice.name}</h4>
              <p className={styles.justiceTitle}>{justice.title}</p>
              <p
                className={styles.justiceParty}
                style={{
                  color: justice.party === "Republican" ? "#DC143C" : "#1E90FF",
                }}
              >
                Appointed by {justice.appointedBy}
              </p>
              <p className={styles.justiceTerm}>
                Confirmed: {justice.confirmed}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

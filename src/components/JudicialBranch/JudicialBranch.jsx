"use client";

import { memo } from "react";
import { FaRepublican, FaDemocrat } from "react-icons/fa";
import { SUPREME_COURT_JUSTICES } from "@/utils/supremeCourtData";
import styles from "./JudicialBranch.module.css";

function JudicialBranch({ breakdown }) {
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
          <div
            key={index}
            className={`${styles.justiceCard} ${
              justice.party === "Republican"
                ? styles.republican
                : styles.democrat
            }`}
          >
            <div className={styles.headerSection}>
              <div className={styles.justiceImageWrapper}>
                <img
                  src={justice.imageUrl}
                  alt={justice.name}
                  className={styles.justiceImage}
                  loading="lazy"
                />
              </div>
            </div>
            <div className={styles.justiceInfo}>
              <h4>{justice.name}</h4>
              <p className={styles.justiceTitle}>{justice.title}</p>
              <div className={styles.signatureWrapper}>
                {justice.signatureUrl && (
                  <img
                    src={justice.signatureUrl}
                    alt={`${justice.name} Signature`}
                    className={styles.signature}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
              <div
                className={styles.partyBadge}
                style={{
                  backgroundColor:
                    justice.party === "Republican" ? "#dc143c" : "#0057b7",
                }}
              >
                {justice.party === "Republican" ? (
                  <FaRepublican size={16} />
                ) : (
                  <FaDemocrat size={16} />
                )}
                <span>{justice.party} Leaning</span>
              </div>
            </div>
            <div className={styles.appointmentInfo}>
              <p>Appointed by {justice.appointedBy}</p>
              <p>Confirmed: {justice.confirmed}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(JudicialBranch);

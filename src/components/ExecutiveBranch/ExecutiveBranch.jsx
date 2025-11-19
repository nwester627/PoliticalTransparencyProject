"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { FaRepublican } from "react-icons/fa";
import Button from "@/components/UI/Button/Button";
import styles from "./ExecutiveBranch.module.css";

function ExecutiveBranch() {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Term ends January 20, 2029 at noon
      const termEnd = new Date("2029-01-20T12:00:00");
      const now = new Date();
      const difference = termEnd - now;

      if (difference <= 0) {
        setTimeRemaining("Term ended");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const years = Math.floor(days / 365);
      const remainingDays = days % 365;

      if (years > 0) {
        setTimeRemaining(
          `${years} year${years !== 1 ? "s" : ""}, ${remainingDays} day${
            remainingDays !== 1 ? "s" : ""
          }, ${hours}h ${minutes}m ${seconds}s`
        );
      } else if (days > 0) {
        setTimeRemaining(
          `${days} day${
            days !== 1 ? "s" : ""
          }, ${hours}h ${minutes}m ${seconds}s`
        );
      } else {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.executiveView}>
      <div className={`${styles.executiveCard} ${styles.president}`}>
        <div className={styles.headerSection}>
          <div className={styles.sealWrapper}>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/Seal_of_the_President_of_the_United_States.svg"
              alt="Seal of the President"
              className={styles.seal}
              width={90}
              height={90}
              sizes="(max-width: 640px) 70px, 90px"
              priority
            />
          </div>
          <div className={styles.executiveImageWrapper}>
            <Image
              src="/assets/Trump-portrait-scaled.jpg"
              alt="President Donald J. Trump"
              className={styles.executiveImage}
              width={180}
              height={180}
              sizes="(max-width: 640px) 150px, 180px"
              priority
              onError={(event) => {
                const target = event.currentTarget;
                target.onerror = null;
                if (!target.src.includes("wikimedia")) {
                  target.src =
                    "https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg";
                } else {
                  target.src = "/images/portrait-placeholder.svg";
                }
              }}
            />
          </div>
        </div>
        <div className={styles.executiveInfo}>
          <h3>Donald J. Trump</h3>
          <p className={styles.executiveTitle}>
            President of the United States
          </p>
          <div className={styles.signatureWrapper}>
            <Image
              src="/assets/Donald_Trump_Signature.png"
              alt="Donald J. Trump Signature"
              className={styles.signature}
              width={140}
              height={50}
              sizes="(max-width: 640px) 120px, 140px"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className={styles.partyBadge}>
            <FaRepublican size={18} />
            <span>Republican</span>
          </div>
          <Button
            onClick={() => (window.location.href = "/president")}
            className={styles.profileButton}
          >
            View Profile
          </Button>
        </div>
        <div className={styles.executiveTerm}>
          Inaugurated: January 20, 2025
        </div>
        <div className={styles.countdown}>
          <span className={styles.countdownLabel}>Remaining time in term:</span>
          <span className={styles.countdownTime}>
            {timeRemaining || "Calculating..."}
          </span>
        </div>
      </div>

      <div className={`${styles.executiveCard} ${styles.vicePresident}`}>
        <div className={styles.headerSection}>
          <div className={styles.sealWrapper}>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Seal_of_the_Vice_President_of_the_United_States.svg"
              alt="Seal of the Vice President"
              className={styles.seal}
              width={90}
              height={90}
              sizes="(max-width: 640px) 70px, 90px"
            />
          </div>
          <div className={styles.executiveImageWrapper}>
            <Image
              src="/assets/jd_vance.jpg"
              alt="Vice President J.D. Vance"
              className={styles.executiveImage}
              width={180}
              height={180}
              sizes="(max-width: 640px) 150px, 180px"
              onError={(event) => {
                const target = event.currentTarget;
                target.onerror = null;
                if (!target.src.includes("wikimedia")) {
                  target.src =
                    "https://upload.wikimedia.org/wikipedia/commons/9/99/JD_Vance_official_portrait%2C_118th_Congress_%28cropped%29.jpg";
                } else {
                  target.src = "/images/portrait-placeholder.svg";
                }
              }}
            />
          </div>
        </div>
        <div className={styles.executiveInfo}>
          <h3>J.D. Vance</h3>
          <p className={styles.executiveTitle}>
            Vice President of the United States
          </p>
          <div className={styles.signatureWrapper}>
            <Image
              src="/assets/JD_Vance_Signature.png"
              alt="J.D. Vance Signature"
              className={styles.signature}
              width={140}
              height={50}
              sizes="(max-width: 640px) 120px, 140px"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className={styles.partyBadge}>
            <FaRepublican size={18} />
            <span>Republican</span>
          </div>
          <Button
            onClick={() => (window.location.href = "/vice-president")}
            className={styles.profileButton}
          >
            View Profile
          </Button>
        </div>
        <div className={styles.executiveTerm}>
          Inaugurated: January 20, 2025
        </div>
        <div className={styles.countdown}>
          <span className={styles.countdownLabel}>Remaining time in term:</span>
          <span className={styles.countdownTime}>
            {timeRemaining || "Calculating..."}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(ExecutiveBranch);

"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./ElectionBanner.module.css";

const ElectionBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <section className={styles.banner}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.pulseDot}></div>
          <span className={styles.text}>Live Election Results</span>
          <Link href="/elections" className={styles.cta}>
            View Now
          </Link>
        </div>
        <button
          className={styles.closeButton}
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        >
          ×
        </button>
      </div>
    </section>
  );
};

export default ElectionBanner;

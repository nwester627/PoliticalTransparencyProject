"use client";

import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { SUPREME_COURT_JUSTICES } from "@/utils/supremeCourtData";
import { GiCapitol } from "react-icons/gi";
import { FaLandmark, FaBalanceScale } from "react-icons/fa";
import styles from "./LeversOfPower.module.css";

// Lazy load branch components for better initial load performance
const ExecutiveBranch = lazy(() =>
  import("@/components/ExecutiveBranch/ExecutiveBranch")
);
const LegislativeMap = lazy(() =>
  import("@/components/LegislativeMap/LegislativeMap")
);
const JudicialBranch = lazy(() =>
  import("@/components/JudicialBranch/JudicialBranch")
);

export default function LeversOfPower() {
  const [senateComposition, setSenateComposition] = useState({});
  const [houseBreakdown, setHouseBreakdown] = useState(null);
  const [houseByState, setHouseByState] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBranch, setActiveBranch] = useState("executive"); // executive, legislative, judicial
  const [legislativeView, setLegislativeView] = useState("senate"); // senate or house

  // Fetch Senate and House data from optimized API route
  useEffect(() => {
    async function loadCongressData() {
      try {
        setLoading(true);
        setError(null);

        // Use server-side API route with caching for better performance
        const response = await fetch("/api/congress?type=detailed");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setSenateComposition(data.senate);
        setHouseBreakdown(data.house);
        setHouseByState(data.houseByState || {});
      } catch (err) {
        console.error("Error loading Congress data:", err);
        setError("Failed to load congressional data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCongressData();
  }, []);

  // Calculate Senate breakdown
  const senateBreakdown = useMemo(() => {
    let republicans = 0;
    let democrats = 0;
    let independents = 0;

    Object.values(senateComposition).forEach((state) => {
      state.senators.forEach((senator) => {
        if (senator.party === "Republican") republicans++;
        else if (senator.party === "Democrat") democrats++;
        else if (senator.party === "Independent") independents++;
      });
    });

    // Democratic caucus includes Democrats + Independents (Sanders & King)
    const democraticCaucus = democrats + independents;

    return {
      republicans,
      democrats,
      independents,
      democraticCaucus,
    };
  }, [senateComposition]);

  // Calculate Supreme Court breakdown
  const supremeCourtBreakdown = useMemo(() => {
    let republicans = 0;
    let democrats = 0;

    SUPREME_COURT_JUSTICES.forEach((justice) => {
      if (justice.party === "Republican") republicans++;
      else if (justice.party === "Democrat") democrats++;
    });

    return { republicans, democrats };
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.sectionHeading}>
          <span className={styles.kicker}>Explore</span>
          <h2 className={styles.title}>Levers of Power</h2>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingBar}>
            <div className={styles.loadingProgress}></div>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.sectionHeading}>
          <span className={styles.kicker}>Explore</span>
          <h2 className={styles.title}>Levers of Power</h2>
        </div>
        <div className={styles.error}>
          {error}
          <br />
          <small>
            Sign up for a free API key at: https://api.congress.gov/sign-up/
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeading}>
        <span className={styles.kicker}>Explore</span>
        <h2 className={styles.title}>Levers of Power</h2>
      </div>

      <div className={styles.viewButtons}>
        <button
          className={`${styles.viewButton} ${
            activeBranch === "executive" ? styles.active : ""
          }`}
          onClick={() => setActiveBranch("executive")}
        >
          <FaLandmark size={24} />
          <span>Executive</span>
        </button>
        <button
          className={`${styles.viewButton} ${
            activeBranch === "legislative" ? styles.active : ""
          }`}
          onClick={() => setActiveBranch("legislative")}
        >
          <GiCapitol size={24} />
          <span>Legislative</span>
        </button>
        <button
          className={`${styles.viewButton} ${
            activeBranch === "judicial" ? styles.active : ""
          }`}
          onClick={() => setActiveBranch("judicial")}
        >
          <FaBalanceScale size={24} />
          <span>Judicial</span>
        </button>
      </div>

      <motion.div
        className={styles.contentContainer}
        key={activeBranch}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
          {activeBranch === "executive" ? (
            <ExecutiveBranch />
          ) : activeBranch === "judicial" ? (
            <JudicialBranch breakdown={supremeCourtBreakdown} />
          ) : (
            <LegislativeMap
              senateComposition={senateComposition}
              senateBreakdown={senateBreakdown}
              houseBreakdown={houseBreakdown}
              houseByState={houseByState}
              legislativeView={legislativeView}
              onLegislativeViewChange={setLegislativeView}
            />
          )}
        </Suspense>
      </motion.div>
    </div>
  );
}

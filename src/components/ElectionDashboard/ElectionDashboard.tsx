"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaExternalLinkAlt } from "react-icons/fa";
import { MdHowToVote } from "react-icons/md";
import {
  fetchElectionDashboardData,
  registrationInfo,
} from "@/utils/electionAPI";
import MotionCard from "@/components/UI/MotionCard/MotionCard";
import styles from "./ElectionDashboard.module.css";

const ElectionDashboard: React.FC = () => {
  const [electionDates, setElectionDates] = useState<any[]>([]);
  const [voterInfo, setVoterInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const data = await fetchElectionDashboardData();
        setElectionDates(data.dates || []);
        setVoterInfo(data.voterInfo || null);
      } catch (err) {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchElectionData();
  }, []);

  return (
    <section className={styles.dashboard}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>Get Ready</span>
            <h2 className={styles.title}>Register to Vote</h2>
          </div>
          <p className={styles.subtitle}>{registrationInfo.intro}</p>
        </motion.div>

        <div className={styles.grid}>
          <MotionCard
            className={`${styles.card} ${styles.registerPanel}`}
            initial={{ opacity: 0, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              duration: 0.6,
            }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <MdHowToVote className={styles.cardIcon} />
                <h3>Register & Prepare</h3>
              </div>

              <motion.div
                className={styles.stickerInline}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.45,
                }}
              >
                <Image
                  src="/assets/ivoted.png"
                  alt="I voted"
                  width={84}
                  height={84}
                  unoptimized
                />
              </motion.div>
            </div>

            <div className={styles.registerIntro}>
              <p>{registrationInfo.intro}</p>
              <ul className={styles.introList} aria-hidden={false}>
                <li>Find your registration status</li>
                <li>Request absentee or mail ballots</li>
                <li>Confirm ID and deadline requirements</li>
              </ul>
            </div>

            <div className={styles.registerResources} role="list">
              {/* Updated resource links per design request */}
              <a
                className={styles.resourceButton}
                href="https://www.vote.org/register-to-vote/"
                target="_blank"
                rel="noreferrer"
                role="listitem"
                aria-label="Register to vote (opens in new tab)"
              >
                <span className={styles.resourceLabel}>Register to vote</span>
                <FaExternalLinkAlt className={styles.resourceIcon} />
              </a>

              <a
                className={styles.resourceButton}
                href="https://www.vote.org/ballot-information/"
                target="_blank"
                rel="noreferrer"
                role="listitem"
                aria-label="What's on the ballot? (opens in new tab)"
              >
                <span className={styles.resourceLabel}>
                  What's on the ballot?
                </span>
                <FaExternalLinkAlt className={styles.resourceIcon} />
              </a>

              <a
                className={styles.resourceButton}
                href="https://www.vote.org/polling-place-locator/"
                target="_blank"
                rel="noreferrer"
                role="listitem"
                aria-label="Find your polling place (opens in new tab)"
              >
                <span className={styles.resourceLabel}>
                  Find your polling place
                </span>
                <FaExternalLinkAlt className={styles.resourceIcon} />
              </a>

              <a
                className={styles.resourceButton}
                href="https://www.usa.gov/election-office"
                target="_blank"
                rel="noreferrer"
                role="listitem"
                aria-label="Find your state's election office (opens in new tab)"
              >
                <span className={styles.resourceLabel}>
                  Find your state's election office
                </span>
                <FaExternalLinkAlt className={styles.resourceIcon} />
              </a>
            </div>

            <div className={styles.resourceNote}>
              <strong>Helpful reminders:</strong>
              <ul className={styles.introList}>
                {registrationInfo.reminders.map((rem: string, idx: number) => (
                  <li key={idx}>{rem}</li>
                ))}
              </ul>
            </div>

            <div className={styles.checkPrompt}>
              <div className={styles.checkQuestion}>
                Not sure if you are registered to vote?
              </div>
              <a
                className={styles.ctaPrimary}
                href="https://www.vote.org"
                target="_blank"
                rel="noreferrer"
                aria-label="Check your registration on Vote.org (opens in new tab)"
              >
                Check Registration
              </a>
            </div>

            <div className={styles.lastUpdated}>
              Need help? Contact your local election office for state-specific
              rules and deadlines.
            </div>
          </MotionCard>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ElectionDashboard);

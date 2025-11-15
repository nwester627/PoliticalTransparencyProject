"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaVoteYea,
  FaNewspaper,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  fetchElectionDashboardData,
  ElectionDate,
  VoterInfo,
} from "@/utils/electionAPI";
import { Card, Button } from "@/components/UI";
import MotionCard from "@/components/UI/MotionCard/MotionCard";
import styles from "./ElectionDashboard.module.css";

const ElectionDashboard: React.FC = () => {
  const [electionDates, setElectionDates] = useState<ElectionDate[]>([]);
  const [voterInfo, setVoterInfo] = useState<VoterInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const data = await fetchElectionDashboardData();
        setElectionDates(data.dates);
        setVoterInfo(data.voterInfo as VoterInfo);
      } catch (error) {
        console.error("Error fetching election data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, []);

  if (loading) {
    return (
      <section className={styles.dashboard}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading election data...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.dashboard}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.title}>Election Dashboard</h2>
          <p className={styles.subtitle}>
            Stay informed with election results, key dates, and voter
            information
          </p>
        </motion.div>

        <div className={styles.grid}>
          {/* Election Results Preview */}
          <MotionCard
            className={styles.card}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={styles.cardHeader}>
              <FaNewspaper className={styles.cardIcon} />
              <h3>Election Results</h3>
            </div>
            <div className={styles.resultsPreview}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>2024 Presidential</span>
                <span className={styles.resultStatus}>Election Day: Nov 5</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Senate Races</span>
                <span className={styles.resultStatus}>34 Seats Contested</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>House Races</span>
                <span className={styles.resultStatus}>435 Seats</span>
              </div>
            </div>
            <Link href="/elections" className={styles.cardLink}>
              View Live Results <FaExternalLinkAlt />
            </Link>
          </MotionCard>

          {/* Key Dates */}
          <MotionCard
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.cardHeader}>
              <FaCalendarAlt className={styles.cardIcon} />
              <h3>Key Election Dates</h3>
            </div>
            <div className={styles.datesList}>
              {electionDates && electionDates.length > 0 ? (
                electionDates.map((date, index) => (
                  <div
                    key={index}
                    className={`${styles.dateItem} ${
                      styles[date.type] || styles.general
                    }`}
                  >
                    <div className={styles.dateInfo}>
                      <div className={styles.dateRow}>
                        <span className={styles.date}>{date.date}</span>
                        {date.status === "completed" ? (
                          <span className={styles.completedBadge}>
                            Completed
                          </span>
                        ) : (
                          <span className={styles.upcomingBadge}>Upcoming</span>
                        )}
                      </div>
                      <span className={styles.event}>{date.event}</span>
                    </div>

                    {date.status === "completed" && date.resultsUrl && (
                      <Link
                        href={date.resultsUrl}
                        className={styles.resultsButton}
                      >
                        See results <FaExternalLinkAlt />
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.noData}>
                  <p>No election dates available</p>
                </div>
              )}
            </div>
            <Link href="/elections" className={styles.cardLink}>
              View Full Calendar <FaExternalLinkAlt />
            </Link>
          </MotionCard>

          {/* Voter Information */}
          <MotionCard
            className={styles.card}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={styles.cardHeader}>
              <FaVoteYea className={styles.cardIcon} />
              <h3>Voter Information</h3>
            </div>
            {voterInfo && (
              <div className={styles.voterInfo}>
                <div className={styles.voterItem}>
                  <strong>Registration Deadline:</strong>
                  <span>{voterInfo.registrationDeadline}</span>
                </div>
                <div className={styles.voterItem}>
                  <strong>Voting Methods:</strong>
                  <div className={styles.methodsList}>
                    {voterInfo.votingMethods.map((method, index) => (
                      <span key={index} className={styles.method}>
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.voterItem}>
                  <strong>Requirements:</strong>
                  <ul className={styles.requirementsList}>
                    {voterInfo.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <a
              href="https://www.vote.org"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardLink}
            >
              Check Your Voter Status <FaExternalLinkAlt />
            </a>
          </MotionCard>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ElectionDashboard);

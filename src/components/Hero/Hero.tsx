"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaUsers, FaVoteYea, FaDollarSign, FaFileAlt } from "react-icons/fa";
import styles from "./Hero.module.css";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section className={styles.hero}>
      <motion.div
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className={styles.title} variants={itemVariants}>
          Political Transparency Project
        </motion.h1>

        <motion.p className={styles.description} variants={itemVariants}>
          Track congressional members, voting records, campaign donations, and
          legislation—all in one transparent platform. Stay informed with
          breaking political news and comprehensive data analysis.
        </motion.p>

        <motion.div className={styles.features} variants={containerVariants}>
          <motion.div
            className={styles.feature}
            variants={featureVariants}
            whileHover={{ scale: 1.05 }}
          >
            <FaUsers /> Member Profiles
          </motion.div>
          <motion.div
            className={styles.feature}
            variants={featureVariants}
            whileHover={{ scale: 1.05 }}
          >
            <FaVoteYea /> Voting Records
          </motion.div>
          <motion.div
            className={styles.feature}
            variants={featureVariants}
            whileHover={{ scale: 1.05 }}
          >
            <FaDollarSign /> Campaign Finance
          </motion.div>
          <motion.div
            className={styles.feature}
            variants={featureVariants}
            whileHover={{ scale: 1.05 }}
          >
            <FaFileAlt /> Bill Tracking
          </motion.div>
        </motion.div>
        <motion.div className={styles.actions} variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/members" className={styles.primaryButton}>
              Explore Members
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/breaking-news" className={styles.secondaryButton}>
              Breaking News
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
        <motion.div className={styles.logoWrap} variants={itemVariants}>
          <Image
            src="/assets/PTP_logo.png"
            alt="Political Transparency Project"
            width={240}
            height={240}
            className={styles.heroLogo}
            quality={100}
            priority
            sizes="(max-width:640px) 120px, (max-width:968px) 160px, 240px"
            unoptimized
          />
        </motion.div>

        <motion.p className={styles.description} variants={itemVariants}>
          Track congressional members, voting records, campaign donations, and
          legislation—all in one transparent platform. Stay informed with
          breaking political news and comprehensive data analysis.
        </motion.p>

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

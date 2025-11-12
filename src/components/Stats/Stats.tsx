"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { FaUsers, FaVoteYea, FaFileAlt, FaDollarSign } from "react-icons/fa";
import styles from "./Stats.module.css";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const spring = useSpring(0, {
    damping: 50,
    stiffness: 100,
    duration: 2000,
  });

  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

function StatItem({ icon, value, label, suffix, delay = 0 }: StatItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={styles.statItem}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.div
        className={styles.iconWrapper}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
      <div className={styles.statValue}>
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
      <div className={styles.statLabel}>{label}</div>
    </motion.div>
  );
}

export default function Stats() {
  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Transparency in Numbers
        </motion.h2>

        <div className={styles.statsGrid}>
          <StatItem
            icon={<FaUsers />}
            value={535}
            label="Congressional Members"
            delay={0.1}
          />
          <StatItem
            icon={<FaVoteYea />}
            value={12450}
            label="Votes Recorded"
            suffix="+"
            delay={0.2}
          />
          <StatItem
            icon={<FaFileAlt />}
            value={8900}
            label="Bills Tracked"
            suffix="+"
            delay={0.3}
          />
          <StatItem
            icon={<FaDollarSign />}
            value={2.4}
            label="Billion in Donations"
            suffix="B"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}

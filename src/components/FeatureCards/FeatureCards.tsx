"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  FaUsers,
  FaVoteYea,
  FaDollarSign,
  FaFileAlt,
  FaNewspaper,
  FaChartLine,
} from "react-icons/fa";
import styles from "./FeatureCards.module.css";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  index: number;
}

function FeatureCard({
  icon,
  title,
  description,
  link,
  index,
}: FeatureCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <Link href={link} className={styles.cardLink}>
      <motion.div
        ref={ref}
        className={styles.card}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
      >
        <motion.div
          className={styles.iconContainer}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>

        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>

        <motion.div
          className={styles.arrow}
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          →
        </motion.div>
      </motion.div>
    </Link>
  );
}

export default function FeatureCards() {
  const features = [
    {
      icon: <FaUsers />,
      title: "Member Profiles",
      description:
        "Detailed profiles of all congressional members with voting history and committee assignments.",
      link: "/members",
    },
    {
      icon: <FaVoteYea />,
      title: "Voting Records",
      description:
        "Track voting patterns, party alignment, and see how representatives vote on key legislation.",
      link: "/voting-records",
    },
    {
      icon: <FaDollarSign />,
      title: "Campaign Finance",
      description:
        "Follow the money with comprehensive donation tracking and top donor information.",
      link: "/donations",
    },
    {
      icon: <FaFileAlt />,
      title: "Bills & Legislation",
      description:
        "Search and track bills as they move through Congress with detailed status updates.",
      link: "/bills",
    },
    {
      icon: <FaNewspaper />,
      title: "Breaking News",
      description:
        "Stay informed with real-time updates on congressional activities and political developments.",
      link: "/breaking-news",
    },
    {
      icon: <FaChartLine />,
      title: "Analytics & Insights",
      description:
        "Data-driven insights and visualizations to understand congressional trends and patterns.",
      link: "/",
    },
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={styles.header}
        >
          <h2 className={styles.sectionTitle}>Explore Our Features</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to understand and track congressional activity
          </p>
        </motion.div>

        <div className={styles.cardsGrid}>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

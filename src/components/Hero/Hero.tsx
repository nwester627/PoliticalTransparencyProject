"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
      {/* Background video is lazy-loaded when the hero enters the viewport.
          We respect prefers-reduced-motion and small screens to avoid
          unnecessary downloads and motion for users who prefer less animation. */}
      <VideoBackground />

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
            sizes="(max-width:640px) 156px, (max-width:968px) 160px, 240px"
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

function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Check for user preference to reduce motion
    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    // Avoid loading video on small screens to save bandwidth
    const isSmallScreen =
      typeof window !== "undefined" ? window.innerWidth <= 640 : false;

    if (prefersReduced || isSmallScreen) {
      setShouldLoad(false);
      return;
    }

    const el =
      heroRef.current || document.querySelector("section." + styles.hero);
    if (!el || typeof IntersectionObserver === "undefined") {
      // No observer support — load immediately
      setShouldLoad(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    io.observe(el as Element);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const v = videoRef.current;
    if (!v) return;
    // try to start playback; some browsers require explicit play after setting source
    v.play().catch(() => {
      /* ignore playback errors */
    });
  }, [shouldLoad]);

  return (
    <>
      <video
        ref={videoRef}
        className={styles.bgVideo}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        {shouldLoad && (
          <source src="/assets/hero_video_background.mp4" type="video/mp4" />
        )}
      </video>
      <div className={styles.videoOverlay} aria-hidden="true" />
    </>
  );
}

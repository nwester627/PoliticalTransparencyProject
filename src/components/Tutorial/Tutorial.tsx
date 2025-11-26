"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  FaHandshake,
  FaUsers,
  FaVoteYea,
  FaDollarSign,
  FaFileAlt,
  FaLightbulb,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { MdHowToVote } from "react-icons/md";
import styles from "./Tutorial.module.css";

interface TutorialStep {
  title: string;
  description: string;
  page: string;
  icon?: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome — Quick Tour",
    description:
      "This short tour highlights the key areas: Home, Registering, Members, and Tools to track legislation and money in politics.",
    page: "intro",
    icon: <FaHandshake />,
  },
  {
    title: "Register to Vote",
    description:
      "Use the Register panel to find official state resources, check registration status, and get absentee ballot info.",
    page: "register",
    icon: <MdHowToVote />,
  },
  {
    title: "Members & Profiles",
    description:
      "Search members to see voting records, committee assignments, sponsored bills, and summarized stats on fundraising and voting alignment.",
    page: "members",
    icon: <FaUsers />,
  },
  {
    title: "Legislative Map & Levers",
    description:
      "Open the Legislative Map to explore state-level details. On mobile, tap the sliding panel to view state summaries and member links.",
    page: "map",
    icon: <FaMapMarkedAlt />,
  },
  {
    title: "Bills & Tracking",
    description:
      "Browse bills and follow their progress. You can track sponsors, statuses, and related appropriations from each bill page.",
    page: "bills",
    icon: <FaFileAlt />,
  },
  {
    title: "Campaign Finance",
    description:
      "The Donations area shows top donors and industry breakdowns. Note: some pages may be under construction while we add full data integrations.",
    page: "donations",
    icon: <FaDollarSign />,
  },
];

export default function Tutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) setIsVisible(true);
    // Runtime diagnostics: if URL contains ?debug-modal=1, inspect ancestors
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("debug-modal") === "1") {
        console.info("Tutorial debug: debug-modal enabled");
      }
    } catch (e) {
      // ignore server environments
    }
  }, []);

  // Diagnostic: when modal is visible and ?debug-modal=1, highlight ancestors
  useEffect(() => {
    if (!modalRef.current) return;
    let cleanupEls: Element[] = [];
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("debug-modal") !== "1") return;

      const modalEl = modalRef.current as HTMLElement;
      console.group("Tutorial modal diagnostics");
      console.log("modal offsetParent:", modalEl.offsetParent);
      console.log("modal boundingClientRect:", modalEl.getBoundingClientRect());
      if ((window as any).visualViewport) {
        console.log("visualViewport:", (window as any).visualViewport);
      }

      // Walk up ancestors from offsetParent (or parentElement) and mark any with transform/filter/contain/will-change/backdrop-filter
      let node: HTMLElement | null =
        (modalEl.offsetParent as HTMLElement | null) || modalEl.parentElement;
      while (node) {
        const cs = window.getComputedStyle(node);
        const hasTransform = cs.transform && cs.transform !== "none";
        const hasFilter = cs.filter && cs.filter !== "none";
        const hasContain = cs.contain && cs.contain !== "none";
        const hasWillChange = cs.willChange && /transform/.test(cs.willChange);
        const hasBackdrop = cs.backdropFilter && cs.backdropFilter !== "none";

        if (
          hasTransform ||
          hasFilter ||
          hasContain ||
          hasWillChange ||
          hasBackdrop
        ) {
          console.warn("Transformed ancestor:", node, {
            transform: cs.transform,
            filter: cs.filter,
            contain: cs.contain,
            willChange: cs.willChange,
            backdropFilter: cs.backdropFilter,
          });
          // add a visible outline to help locate it on the page
          (node as HTMLElement).style.outline = "3px dashed rgba(255,0,0,0.85)";
          (node as HTMLElement).style.outlineOffset = "4px";
          cleanupEls.push(node);
        }

        node = node.parentElement;
      }
      console.groupEnd();
    } catch (e) {
      // ignore
    }

    return () => {
      cleanupEls.forEach((n) => {
        try {
          (n as HTMLElement).style.outline = "";
          (n as HTMLElement).style.outlineOffset = "";
        } catch (e) {}
      });
    };
  }, [isVisible]);

  const handleOpen = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) setCurrentStep((s) => s + 1);
    else handleClose();
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setIsVisible(false);
  };

  const currentStepData = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <>
      {!isVisible && (
        <motion.button
          className={styles.triggerButton}
          onClick={handleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          aria-label="Open tour"
        >
          <FaLightbulb className={styles.triggerIcon} />
          <span className={styles.triggerText}>Tour</span>
        </motion.button>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                className={styles.portalWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={styles.backdrop}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleSkip}
                />

                <motion.div
                  className={styles.tutorialModal}
                  ref={modalRef}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <button
                    className={styles.closeButton}
                    onClick={handleSkip}
                    aria-label="Close tour"
                  >
                    ✕
                  </button>

                  <motion.div
                    className={styles.icon}
                    key={currentStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    {currentStepData.icon}
                  </motion.div>

                  <motion.div
                    className={styles.content}
                    key={`content-${currentStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className={styles.title}>{currentStepData.title}</h2>
                    <p className={styles.description}>
                      {currentStepData.description}
                    </p>
                  </motion.div>

                  <div className={styles.progressContainer}>
                    {tutorialSteps.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`${styles.progressDot} ${
                          index === currentStep ? styles.activeDot : ""
                        }`}
                        animate={{ scale: index === currentStep ? 1.2 : 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        onClick={() => setCurrentStep(index)}
                      />
                    ))}
                  </div>

                  <div className={styles.buttonGroup}>
                    {!isFirstStep && (
                      <motion.button
                        className={`${styles.button} ${styles.secondaryButton}`}
                        onClick={handlePrevious}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Previous
                      </motion.button>
                    )}

                    <motion.button
                      className={styles.skipButton}
                      onClick={handleSkip}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Skip Tour
                    </motion.button>

                    <motion.button
                      className={`${styles.button} ${styles.primaryButton}`}
                      onClick={handleNext}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLastStep ? "Get Started" : "Next"}
                    </motion.button>
                  </div>

                  <div className={styles.stepCounter}>
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

// Diagnostic effect: highlight transformed ancestors when debug flag present
if (typeof window !== "undefined") {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug-modal") === "1") {
      // Delay to allow portal to mount
      window.addEventListener("load", () => {
        setTimeout(() => {
          const el = document.querySelector("." + ("" as any));
        }, 500);
      });
    }
  } catch (e) {
    // noop
  }
}

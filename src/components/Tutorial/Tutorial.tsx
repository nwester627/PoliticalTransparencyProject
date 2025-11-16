"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHandshake,
  FaUsers,
  FaVoteYea,
  FaDollarSign,
  FaFileAlt,
  FaNewspaper,
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

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleOpen = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
      {/* Tutorial Trigger Button */}
      {!isVisible && (
        <motion.button
          className={styles.triggerButton}
          onClick={handleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          aria-label="Open tutorial"
        >
          <FaLightbulb className={styles.triggerIcon} />
          <span className={styles.triggerText}>Tutorial</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSkip}
            />

            {/* Tutorial Modal */}
            <motion.div
              className={styles.tutorialModal}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Close Button */}
              <button
                className={styles.closeButton}
                onClick={handleSkip}
                aria-label="Close tutorial"
              >
                ✕
              </button>

              {/* Icon */}
              <motion.div
                className={styles.icon}
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
              >
                {currentStepData.icon}
              </motion.div>

              {/* Content */}
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

              {/* Progress Indicators */}
              <div className={styles.progressContainer}>
                {tutorialSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`${styles.progressDot} ${
                      index === currentStep ? styles.activeDot : ""
                    }`}
                    animate={{
                      scale: index === currentStep ? 1.2 : 1,
                    }}
                    transition={{ type: "spring", damping: 15 }}
                    onClick={() => setCurrentStep(index)}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
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

              {/* Step Counter */}
              <div className={styles.stepCounter}>
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

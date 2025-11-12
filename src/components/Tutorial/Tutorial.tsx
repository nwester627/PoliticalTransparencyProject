"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Tutorial.module.css";

interface TutorialStep {
  title: string;
  description: string;
  page: string;
  icon?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Political Transparency Project",
    description:
      "Your source for tracking congressional activity, voting records, and campaign finance. Let's take a quick tour of what you can do here.",
    page: "intro",
    icon: "👋",
  },
  {
    title: "Member Profiles",
    description:
      "Explore detailed profiles of congressional members including their voting history, committee assignments, and sponsored bills.",
    page: "members",
    icon: "👥",
  },
  {
    title: "Voting Records",
    description:
      "Track how members vote on key legislation. See party alignment, vote breakdowns, and individual voting patterns.",
    page: "voting-records",
    icon: "🗳️",
  },
  {
    title: "Campaign Donations",
    description:
      "Follow the money. View top donors, contribution trends, and campaign finance data for transparency.",
    page: "donations",
    icon: "💰",
  },
  {
    title: "Bills & Legislation",
    description:
      "Browse and search active bills, track their progress through Congress, and see who's sponsoring them.",
    page: "bills",
    icon: "📋",
  },
  {
    title: "Breaking News",
    description:
      "Stay updated with the latest political developments, votes, and congressional activities in real-time.",
    page: "breaking-news",
    icon: "📰",
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
          <span className={styles.triggerIcon}>💡</span>
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

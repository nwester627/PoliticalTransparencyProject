"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaRepublican, FaDemocrat, FaPhone, FaClock } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import styles from "./LegislativeMap.module.css";

export default function SenatePanel({ stateData, onClose }) {
  const senators = Array.isArray(stateData?.senators) ? stateData.senators : [];
  const containerRef = useRef(null);
  const [expandedId, setExpandedId] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const hasStateData = Boolean(stateData);
  const stateName = stateData?.name ?? "";

  useEffect(() => {
    setFailedImages({});
  }, [stateData?.name]);

  const handleImageError = (memberId) => {
    if (!memberId) {
      return;
    }
    setFailedImages((prev) => {
      if (prev[memberId]) {
        return prev;
      }
      return { ...prev, [memberId]: true };
    });
  };

  const handleExpand = (bioguideId) => {
    setExpandedId((prev) => (prev === bioguideId ? null : bioguideId));

    if (!bioguideId) return;

    const container = containerRef.current;
    if (!container) return;

    const targetCard = container.querySelector(
      `[data-senator-id="${bioguideId}"]`
    );

    if (targetCard && typeof targetCard.scrollIntoView === "function") {
      targetCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const currentYear = new Date().getFullYear();

  return !hasStateData ? null : (
    <>
      <div className={styles.panelHeader}>
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Seal_of_the_United_States_Senate.svg"
          alt="Seal of the United States Senate"
          width={80}
          height={80}
          className={styles.chamberSeal}
          sizes="(max-width: 640px) 64px, 80px"
          priority
        />
        <div className={styles.panelHeaderInner}>
          <h3>{stateName}</h3>
          <div className={styles.subtitle}>U.S. Senators</div>
        </div>
      </div>

      <button onClick={onClose} className={styles.backButton}>
        Show All States
      </button>

      <div className={styles.senateMembersGrid} ref={containerRef}>
        {senators.length > 0 ? (
          senators.map((senator, index) => {
            const isExpanded = senator.bioguideId === expandedId;
            const memberHref = senator.bioguideId
              ? `/members/${senator.bioguideId}`
              : "/members";
            const serviceYears = senator.startYear
              ? Math.max(currentYear - Number(senator.startYear) + 1, 1)
              : null;
            const phoneLabel = senator.officePhone || "Unavailable";
            const contactForm = senator.contactForm || null;
            const senatorIdentifier =
              senator.bioguideId || `${senator.name}-${index}`;
            const shouldRenderImage =
              Boolean(senator.depiction) && !failedImages[senatorIdentifier];

            return (
              <motion.div
                key={senator.bioguideId || `${senator.name}-${index}`}
                data-senator-id={
                  senator.bioguideId || `${senator.name}-${index}`
                }
                className={`${styles.senatorCard} ${
                  senator.party === "Republican"
                    ? styles.republican
                    : senator.party === "Democrat"
                    ? styles.democrat
                    : styles.independent
                } ${isExpanded ? styles.senatorCardExpanded : ""}`}
                layout
                onClick={() => handleExpand(senator.bioguideId)}
                transition={{
                  layout: { type: "spring", damping: 26, stiffness: 420 },
                }}
              >
                <div className={styles.senatorSummary}>
                  <div className={styles.senatorImageWrapper}>
                    {shouldRenderImage ? (
                      <Image
                        src={senator.depiction}
                        alt={senator.name}
                        className={styles.memberImage}
                        width={72}
                        height={72}
                        sizes="72px"
                        onError={() => handleImageError(senatorIdentifier)}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <span>{senator.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.senatorInfo}>
                    <h4>{senator.name}</h4>
                    {senator.startYear && (
                      <p className={styles.memberTerm}>
                        Since {senator.startYear}
                      </p>
                    )}
                    <div
                      className={styles.partyBadge}
                      style={{
                        backgroundColor:
                          senator.party === "Republican"
                            ? "#dc143c"
                            : senator.party === "Democrat"
                            ? "#0057b7"
                            : "#9370DB",
                      }}
                    >
                      {senator.party === "Republican" ? (
                        <FaRepublican size={14} />
                      ) : senator.party === "Democrat" ? (
                        <FaDemocrat size={14} />
                      ) : null}
                      <span>{senator.party}</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="senator-preview"
                      className={styles.memberPreview}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.24, ease: "easeInOut" }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className={styles.memberPreviewRow}>
                        <span className={styles.memberPreviewLabel}>
                          Service
                        </span>
                        <span className={styles.memberPreviewValue}>
                          <FaClock size={12} />
                          <span>
                            {serviceYears
                              ? `${serviceYears} year${
                                  serviceYears > 1 ? "s" : ""
                                }`
                              : "Unknown tenure"}
                          </span>
                        </span>
                      </div>
                      <div className={styles.memberPreviewRow}>
                        <span className={styles.memberPreviewLabel}>Phone</span>
                        <span className={styles.memberPreviewValue}>
                          <FaPhone size={12} />
                          <span>{phoneLabel}</span>
                        </span>
                      </div>
                      {contactForm && (
                        <div className={styles.memberPreviewRow}>
                          <span className={styles.memberPreviewLabel}>
                            Contact
                          </span>
                          <span className={styles.memberPreviewValue}>
                            <a
                              href={contactForm}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.memberPreviewLink}
                              onClick={(event) => event.stopPropagation()}
                            >
                              Contact Form
                            </a>
                          </span>
                        </div>
                      )}
                      <div className={styles.memberPreviewActions}>
                        <Link
                          href={memberHref}
                          className={styles.memberPreviewButton}
                          onClick={(event) => event.stopPropagation()}
                        >
                          View More
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className={styles.emptyState}>No senators data available</div>
        )}
      </div>
    </>
  );
}

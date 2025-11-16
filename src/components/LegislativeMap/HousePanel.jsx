"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRepublican, FaDemocrat, FaPhone, FaClock } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./LegislativeMap.module.css";

export default function HousePanel({
  stateData,
  onClose,
  featuredRepresentativeId,
  onRepresentativeFocus,
}) {
  const representatives = Array.isArray(stateData?.representatives)
    ? stateData.representatives
    : [];
  const stateName = stateData?.name ?? "";
  const hasStateData = Boolean(stateData);

  // Get state code from first representative (they all share the same state)
  const getStateCode = () => {
    if (representatives.length > 0) {
      // Extract state code from bioguideId or use a mapping
      // For now, we'll create a simple abbreviation from state name
      const stateAbbreviations = {
        Alabama: "AL",
        Alaska: "AK",
        Arizona: "AZ",
        Arkansas: "AR",
        California: "CA",
        Colorado: "CO",
        Connecticut: "CT",
        Delaware: "DE",
        Florida: "FL",
        Georgia: "GA",
        Hawaii: "HI",
        Idaho: "ID",
        Illinois: "IL",
        Indiana: "IN",
        Iowa: "IA",
        Kansas: "KS",
        Kentucky: "KY",
        Louisiana: "LA",
        Maine: "ME",
        Maryland: "MD",
        Massachusetts: "MA",
        Michigan: "MI",
        Minnesota: "MN",
        Mississippi: "MS",
        Missouri: "MO",
        Montana: "MT",
        Nebraska: "NE",
        Nevada: "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        Ohio: "OH",
        Oklahoma: "OK",
        Oregon: "OR",
        Pennsylvania: "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        Tennessee: "TN",
        Texas: "TX",
        Utah: "UT",
        Vermont: "VT",
        Virginia: "VA",
        Washington: "WA",
        "West Virginia": "WV",
        Wisconsin: "WI",
        Wyoming: "WY",
      };
      return stateAbbreviations[stateName] || "";
    }
    return "";
  };

  const stateCode = getStateCode();

  const membersGridRef = useRef(null);
  const [expandedRepId, setExpandedRepId] = useState(null);
  const [failedImages, setFailedImages] = useState({});

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

  useEffect(() => {
    if (!featuredRepresentativeId) {
      return;
    }

    setExpandedRepId(featuredRepresentativeId);

    const container = membersGridRef.current;
    if (!container) {
      return;
    }

    const targetCard = container.querySelector(
      `[data-rep-id="${featuredRepresentativeId}"]`
    );

    if (targetCard && typeof targetCard.scrollIntoView === "function") {
      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [featuredRepresentativeId]);

  const currentYear = new Date().getFullYear();

  return !hasStateData ? null : (
    <>
      <div className={styles.panelHeader}>
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Seal_of_the_United_States_House_of_Representatives.svg"
          alt="Seal of the United States House of Representatives"
          width={80}
          height={80}
          className={styles.chamberSeal}
          sizes="(max-width: 640px) 64px, 80px"
          priority
        />
        <div className={styles.panelHeaderInner}>
          <h3>{stateName}</h3>
          <div className={styles.subtitle}>
            {representatives.length} U.S. Representative
            {representatives.length !== 1 ? "s" : ""}
          </div>
          <button onClick={onClose} className={styles.backButtonInline}>
            Show All States
          </button>
        </div>
      </div>

      <div className={styles.membersGrid} ref={membersGridRef}>
        {representatives.length > 0 ? (
          representatives.map((rep, index) => {
            const isExpanded = rep.bioguideId === expandedRepId;
            const districtLabel = rep.district
              ? rep.district === "At-Large"
                ? `${stateCode} At-Large`
                : `${stateCode}-${String(rep.district).padStart(2, "0")}`
              : "";
            const serviceYears = rep.startYear
              ? Math.max(currentYear - Number(rep.startYear) + 1, 1)
              : null;
            const phoneLabel = rep.officePhone || rep.phone || "Unavailable";
            const contactForm = rep.contactForm || null;
            const memberHref = rep.bioguideId
              ? `/member/${rep.bioguideId}`
              : "/members";
            const repKey = rep.bioguideId || `${rep.name}-${index}`;
            const repIdentifier = rep.bioguideId || repKey;
            const shouldRenderImage =
              Boolean(rep.depiction) && !failedImages[repIdentifier];

            // Normalize internal contact links (convert `/members/{id}` -> `/member/{id}`)
            let normalizedContact = contactForm;
            try {
              if (contactForm) {
                if (contactForm.startsWith("/")) {
                  normalizedContact = contactForm.replace(
                    /^\/members\//,
                    "/member/"
                  );
                } else if (
                  typeof window !== "undefined" &&
                  contactForm.startsWith(window.location.origin)
                ) {
                  const path = contactForm.replace(window.location.origin, "");
                  normalizedContact = path.replace(/^\/members\//, "/member/");
                }
              }
            } catch (e) {
              normalizedContact = contactForm;
            }

            const contactIsInternal =
              normalizedContact && normalizedContact.startsWith("/");

            return (
              <motion.div
                layout
                key={repKey}
                data-rep-id={rep.bioguideId || repKey}
                className={`${styles.memberCard} ${
                  rep.party === "Republican"
                    ? styles.republican
                    : rep.party === "Democrat"
                    ? styles.democrat
                    : styles.independent
                } ${isExpanded ? styles.memberCardExpanded : ""}`}
                onClick={() => {
                  setExpandedRepId((prev) => {
                    const nextId =
                      prev === rep.bioguideId ? null : rep.bioguideId;
                    if (onRepresentativeFocus) onRepresentativeFocus(nextId);
                    return nextId;
                  });
                }}
                transition={{
                  layout: { type: "spring", damping: 26, stiffness: 420 },
                  opacity: { duration: 0.2 },
                }}
              >
                <div className={styles.memberSummary}>
                  <div className={styles.memberImageWrapper}>
                    {shouldRenderImage ? (
                      <Image
                        src={rep.depiction}
                        alt={rep.name}
                        className={styles.memberImage}
                        width={72}
                        height={72}
                        sizes="72px"
                        onError={() => handleImageError(repIdentifier)}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <span>{rep.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.memberInfo}>
                    <h4>{rep.name}</h4>
                    {rep.district && (
                      <p className={styles.memberDistrict}>
                        {rep.district === "At-Large"
                          ? `${stateCode}-AL`
                          : `${stateCode}-D${String(rep.district).padStart(
                              2,
                              "0"
                            )}`}
                      </p>
                    )}
                    {rep.startYear && (
                      <p className={styles.memberTerm}>Since {rep.startYear}</p>
                    )}
                    <div
                      className={styles.partyBadge}
                      style={{
                        backgroundColor:
                          rep.party === "Republican"
                            ? "#dc143c"
                            : rep.party === "Democrat"
                            ? "#0057b7"
                            : "#9370DB",
                      }}
                    >
                      {rep.party === "Republican" ? (
                        <FaRepublican size={12} />
                      ) : rep.party === "Democrat" ? (
                        <FaDemocrat size={12} />
                      ) : null}
                      <span>{rep.party}</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="preview"
                      className={styles.memberPreview}
                      layout
                      layoutDependency={expandedRepId}
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{
                        opacity: { duration: 0.18 },
                        height: { duration: 0.32, ease: [0.25, 0.8, 0.25, 1] },
                        y: { duration: 0.32, ease: [0.25, 0.8, 0.25, 1] },
                      }}
                    >
                      <div className={styles.memberPreviewRow}>
                        <span className={styles.memberPreviewLabel}>
                          District
                        </span>
                        <span className={styles.memberPreviewValue}>
                          {districtLabel}
                        </span>
                      </div>
                      <div className={styles.memberPreviewRow}>
                        <span className={styles.memberPreviewLabel}>Party</span>
                        <span className={styles.memberPreviewValue}>
                          {rep.party}
                        </span>
                      </div>
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
                          <span className={styles.memberPreviewPhone}>
                            {phoneLabel}
                          </span>
                        </span>
                      </div>

                      {contactForm && (
                        <div className={styles.memberPreviewRow}>
                          <span className={styles.memberPreviewLabel}>
                            Contact
                          </span>
                          <span className={styles.memberPreviewValue}>
                            {contactIsInternal ? (
                              <Link
                                href={normalizedContact}
                                className={styles.memberPreviewLink}
                                onClick={(event) => event.stopPropagation()}
                              >
                                Contact Form
                              </Link>
                            ) : (
                              <a
                                href={normalizedContact}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.memberPreviewLink}
                                onClick={(event) => event.stopPropagation()}
                              >
                                Contact Form
                              </a>
                            )}
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
          <div className={styles.emptyState}>
            No representatives data available
          </div>
        )}
      </div>
    </>
  );
}

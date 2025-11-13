"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaRepublican, FaDemocrat, FaTimes } from "react-icons/fa";
import styles from "./MemberDetailSidebar.module.css";

export default function MemberDetailSidebar({
  stateData,
  legislativeView,
  onClose,
}) {
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    setFailedImages({});
  }, [stateData?.name, legislativeView]);

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

  if (!stateData) return null;

  const renderMemberCard = (member, index) => {
    const party = member.party || "Unknown";
    const isRepublican = party === "Republican";
    const isDemocrat = party === "Democrat";
    const memberKey = member.bioguideId || `${member.name}-${index}`;
    const shouldRenderImage =
      Boolean(member.depiction) && !failedImages[memberKey];

    return (
      <div
        key={index}
        className={`${styles.memberCard} ${
          isRepublican
            ? styles.republican
            : isDemocrat
            ? styles.democrat
            : styles.independent
        }`}
      >
        <div className={styles.headerSection}>
          <div className={styles.memberImageWrapper}>
            {shouldRenderImage ? (
              <Image
                src={member.depiction}
                alt={member.name}
                className={styles.memberImage}
                width={100}
                height={100}
                sizes="100px"
                onError={() => handleImageError(memberKey)}
              />
            ) : (
              <div className={styles.placeholderImage}>
                <span>{member.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
        <div className={styles.memberInfo}>
          <h4>{member.name}</h4>
          {legislativeView === "house" && member.district && (
            <p className={styles.memberDistrict}>District {member.district}</p>
          )}
          {member.startYear && (
            <p className={styles.memberTerm}>Since {member.startYear}</p>
          )}
          <div
            className={styles.partyBadge}
            style={{
              backgroundColor: isRepublican
                ? "#dc143c"
                : isDemocrat
                ? "#0057b7"
                : "#9370DB",
            }}
          >
            {isRepublican ? (
              <FaRepublican size={16} />
            ) : isDemocrat ? (
              <FaDemocrat size={16} />
            ) : null}
            <span>{party}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <div>
            <h3>{stateData.name}</h3>
            <p className={styles.subtitle}>
              {legislativeView === "senate"
                ? "U.S. Senators"
                : "U.S. Representatives"}
            </p>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close popup"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <button onClick={onClose} className={styles.backButton}>
          Show Full Map
        </button>

        <div className={styles.membersContainer}>
          {legislativeView === "senate" ? (
            <>
              {stateData.senators && stateData.senators.length > 0 ? (
                stateData.senators.map((senator, index) =>
                  renderMemberCard(senator, index)
                )
              ) : (
                <div className={styles.emptyState}>
                  No senators data available
                </div>
              )}
            </>
          ) : (
            <>
              {stateData.representatives &&
              stateData.representatives.length > 0 ? (
                stateData.representatives.map((rep, index) =>
                  renderMemberCard(rep, index)
                )
              ) : (
                <div className={styles.emptyState}>
                  No representatives data available
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

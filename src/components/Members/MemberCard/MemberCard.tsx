import React, { useEffect, useState } from "react";
import Card from "@/components/UI/Card/Card";
import Button from "@/components/UI/Button/Button";
import Image from "next/image";
import { FaRepublican, FaDemocrat } from "react-icons/fa";
import styles from "./MemberCard.module.css";

interface MemberCardProps {
  name: string;
  party?: string | null;
  state?: string | null;
  id?: string | null;
  portraitUrl?: string | null;
  district?: string | null;
  committees?: number;
  bills?: number;
  billsCosponsored?: number;
  yearsInService?: number;
  onViewProfile?: () => void;
}

export default function MemberCard({
  name,
  party,
  state,
  id = null,
  portraitUrl = null,
  district = null,
  committees = 0,
  bills = 0,
  billsCosponsored = 0,
  yearsInService = 0,
  onViewProfile,
}: MemberCardProps) {
  const key = party ? party.toLowerCase() : "";
  const partyKey = key.includes("republic")
    ? "republican"
    : key.includes("democ")
    ? "democrat"
    : "independent";

  const cardClass = `${styles.memberCard} ${styles[partyKey] || ""}`;
  const badgeClass = `${styles.partyBadge} ${styles[partyKey] || ""}`;

  return (
    <Card hover className={cardClass}>
      <div className={styles.headerSection}>
        <div className={styles.photoPlaceholder}>
          {portraitUrl ? (
            <Image
              src={portraitUrl}
              alt={name}
              width={300}
              height={300}
              className={styles.photoImage}
              sizes="(max-width: 640px) 150px, 300px"
            />
          ) : (
            <span className={styles.photoIcon}>👤</span>
          )}
        </div>
      </div>

      <div className={styles.memberInfo}>
        <h3 className={styles.memberName}>{name}</h3>
        <p className={styles.memberDetails}>
          {party || ""} {party && state ? " - " : ""} {state || ""}{" "}
          {district ? `• ${district}` : ""}
        </p>

        <div className={badgeClass}>
          <span className={styles.badgeIcon}>
            {partyKey === "republican" && <FaRepublican size={14} />}
            {partyKey === "democrat" && <FaDemocrat size={14} />}
            {partyKey === "independent" && <span>I</span>}
          </span>
          {party || ""}
        </div>

        <div className={styles.memberStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Sponsored</span>
            <span className={styles.statValue}>{bills}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Cosponsored</span>
            <span className={styles.statValue}>{billsCosponsored}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Years</span>
            <span className={styles.statValue}>{yearsInService}</span>
          </div>
        </div>

        <Button fullWidth onClick={onViewProfile}>
          View Full Profile
        </Button>
      </div>
    </Card>
  );
}

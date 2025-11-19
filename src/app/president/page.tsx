"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/UI/Button/Button";
import Image from "next/image";
import Footer from "@/components/Footer/Footer";
import {
  FaRepublican,
  FaPhone,
  FaGlobe,
  FaArrowLeft,
  FaBirthdayCake,
  FaMapMarkerAlt,
} from "react-icons/fa";
import styles from "./page.module.css";

export default function PresidentPage(): JSX.Element {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, []);

  const calculateAge = (birthYear: number): number => {
    const currentYear = 2025;
    return currentYear - birthYear;
  };

  if (loading) {
    return (
      <>
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loading}>Loading...</div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.container}>
          <Button
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            <FaArrowLeft /> Back
          </Button>

          <section
            className={`${styles.profileBanner} ${styles.republican}`}
            aria-labelledby="president-heading"
          >
            <div className={styles.bannerSeal} aria-hidden>
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/Seal_of_the_President_of_the_United_States.svg"
                alt="President Seal"
                width={88}
                height={88}
                unoptimized
              />
            </div>
            <div className={styles.bannerTitle}>
              <h1 id="president-heading" className={styles.bannerName}>
                Donald J. Trump
              </h1>
              <div className={styles.bannerSubtitle}>
                President of the United States
              </div>
            </div>
            <div
              className={`${styles.bannerIcon} ${styles.republican}`}
              aria-hidden
            >
              <FaRepublican size={24} />
            </div>
          </section>

          <header className={`${styles.profileHeader} ${styles.republican}`}>
            <div className={styles.profileImage}>
              <Image
                src="/assets/Trump-portrait-scaled.jpg"
                alt="President Portrait"
                width={220}
                height={220}
                className={styles.image}
                unoptimized
              />
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.leftSection}>
                <h2 className={styles.memberName}>Donald J. Trump</h2>
                <p className={styles.memberTitle}>
                  President of the United States
                </p>
                <div className={styles.badgesContainer}>
                  <div className={`${styles.partyBadge} ${styles.republican}`}>
                    <FaRepublican size={14} /> Republican
                  </div>
                </div>
              </div>

              <div className={styles.rightSection}>
                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <FaBirthdayCake />{" "}
                    <span>Born: June 14, 1946 ({calculateAge(1946)})</span>
                  </div>
                  <div className={styles.contactItem}>
                    <FaMapMarkerAlt /> <span>Queens, New York</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className={styles.profileGrid}>
            <article className={`${styles.statsCard} ${styles.wideCard}`}>
              <h3 className={styles.sectionTitle}>Biography</h3>
              <div className={styles.bioDetails}>
                <p>
                  Donald John Trump is the 47th President of the United States,
                  serving his second non-consecutive term. Born in Queens, New
                  York, in 1946, Trump built a successful career as a real
                  estate developer, entrepreneur, and television personality. He
                  took over his family's real estate business in the 1970s,
                  expanding it into a global empire that included hotels,
                  casinos, and golf courses. Trump gained widespread fame as the
                  host of the NBC reality show "The Apprentice" from 2004 to
                  2015, where his catchphrase "You're fired!" became iconic.
                </p>
                <p>
                  Entering politics in 2015, Trump announced his candidacy for
                  president as a Republican outsider, campaigning on an "America
                  First" platform. He won the 2016 election against Hillary
                  Clinton, becoming the 45th President and serving from 2017 to
                  2021. After losing the 2020 election to Joe Biden, Trump
                  challenged the results, leading to the January 6, 2021,
                  Capitol riot. He returned to politics and won the 2024
                  election, defeating Kamala Harris to become the 47th
                  President, inaugurated on January 20, 2025.
                </p>
                <p>
                  Known for his unconventional style, Trump has been a
                  polarizing figure, praised by supporters for his business
                  acumen and criticized by opponents for his rhetoric and
                  policies. His administration focused on deregulation, tax
                  cuts, and a hardline stance on immigration and trade.
                </p>
              </div>
            </article>

            <article className={styles.termsCard}>
              <h3 className={styles.sectionTitle}>Terms in Office</h3>
              <div className={styles.termsList}>
                <div
                  className={`${styles.termItem} ${styles.republican} ${styles.currentTerm}`}
                >
                  <div className={styles.termHead}>
                    <div className={styles.termPills}>
                      <div
                        className={`${styles.termPill} ${styles.republican}`}
                      >
                        47th President
                      </div>
                    </div>
                  </div>
                  <div className={styles.termLabel}>
                    <div className={styles.termState}>2025 - 2029</div>
                    <div className={styles.termYears}>
                      Inaugurated January 20, 2025
                    </div>
                  </div>
                </div>
                <div className={`${styles.termItem} ${styles.republican}`}>
                  <div className={styles.termHead}>
                    <div className={styles.termPills}>
                      <div
                        className={`${styles.termPill} ${styles.republican}`}
                      >
                        45th President
                      </div>
                    </div>
                  </div>
                  <div className={styles.termLabel}>
                    <div className={styles.termState}>2017 - 2021</div>
                    <div className={styles.termYears}>
                      Inaugurated January 20, 2017
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className={styles.statsCard}>
              <h3 className={styles.sectionTitle}>Contact Information</h3>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <FaPhone />{" "}
                  <a href="tel:(202) 456-1111">Phone: (202) 456-1111</a>
                </div>
                <div className={styles.contactItem}>
                  <FaGlobe />{" "}
                  <a
                    href="https://whitehouse.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website: whitehouse.gov
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <FaMapMarkerAlt />{" "}
                  <span>1600 Pennsylvania Avenue NW, Washington, DC 20500</span>
                </div>
              </div>
            </article>

            <article className={`${styles.financesCard} ${styles.wideCard}`}>
              <h3 className={styles.sectionTitle}>Campaign Promises</h3>
              <div className={styles.financesContent}>
                <p>
                  President Trump's second term focuses on several key
                  initiatives that were central to his 2024 campaign platform:
                </p>
                <ul>
                  <li>
                    <strong>Border Security:</strong> Completing the border wall
                    and implementing stricter immigration policies to secure the
                    southern border.
                  </li>
                  <li>
                    <strong>Economic Prosperity:</strong> Tax cuts,
                    deregulation, and bringing manufacturing jobs back to
                    America through tariffs and trade deals.
                  </li>
                  <li>
                    <strong>America First Foreign Policy:</strong> Reducing
                    overseas military commitments, renegotiating alliances, and
                    prioritizing U.S. interests in international relations.
                  </li>
                  <li>
                    <strong>Law and Order:</strong> Supporting police, cracking
                    down on crime, and reforming the justice system.
                  </li>
                  <li>
                    <strong>Energy Independence:</strong> Expanding domestic
                    energy production, including oil, gas, and clean energy
                    sources.
                  </li>
                  <li>
                    <strong>Healthcare Reform:</strong> Working towards more
                    affordable healthcare options and reducing prescription drug
                    prices.
                  </li>
                </ul>
                <p>
                  As policies develop and legislation is proposed, this section
                  will be updated with specific bills, executive actions, and
                  progress reports.
                </p>
              </div>
            </article>
          </section>
        </div>
      </main>
    </>
  );
}

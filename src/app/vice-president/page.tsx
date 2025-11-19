"use client";

import { useEffect, useState } from "react";
import Card from "@/components/UI/Card/Card";
import Button from "@/components/UI/Button/Button";
import Image from "next/image";
import {
  FaRepublican,
  FaPhone,
  FaGlobe,
  FaArrowLeft,
  FaFileAlt,
  FaBirthdayCake,
  FaMapMarkerAlt,
} from "react-icons/fa";
import styles from "./page.module.css";

export default function VicePresidentPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
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

          <div className={`${styles.profileBanner} ${styles.republican}`}>
            <div className={styles.bannerSeal}>
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Seal_of_the_Vice_President_of_the_United_States.svg"
                alt="Seal of the Vice President"
                width={80}
                height={80}
                unoptimized
              />
            </div>
            <div className={styles.bannerTitle}>
              <div className={styles.bannerName}>J.D. Vance</div>
              <div className={styles.bannerSubtitle}>
                Vice President of the United States
              </div>
            </div>
            <div className={`${styles.bannerIcon} ${styles.republican}`}>
              <FaRepublican size={24} />
            </div>
          </div>

          <div className={`${styles.profileHeader} ${styles.republican}`}>
            <div className={styles.profileImage}>
              <Image
                src="/assets/jd_vance.jpg"
                alt="J.D. Vance"
                width={200}
                height={200}
                className={styles.image}
                unoptimized
                onError={(event) => {
                  const target = event.currentTarget;
                  target.onerror = null;
                  target.src =
                    "https://upload.wikimedia.org/wikipedia/commons/9/99/JD_Vance_official_portrait%2C_118th_Congress_%28cropped%29.jpg";
                }}
              />
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.leftSection}>
                <h1 className={styles.memberName}>J.D. Vance</h1>
                <p className={styles.memberTitle}>
                  Vice President of the United States
                </p>
                <div className={styles.badgesContainer}>
                  <div className={`${styles.partyBadge} ${styles.republican}`}>
                    <FaRepublican size={16} />
                    Republican
                  </div>
                </div>
              </div>
              <div className={styles.rightSection}>
                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <FaBirthdayCake />
                    <span>Born: August 2, 1984 ({calculateAge(1984)})</span>
                  </div>
                  <div className={styles.contactItem}>
                    <FaMapMarkerAlt />
                    <span>Middletown, Ohio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.profileGrid}>
            <article className={`${styles.statsCard} ${styles.wideCard}`}>
              <h3 className={styles.sectionTitle}>Biography</h3>
              <div className={styles.bioDetails}>
                <p>
                  James David Vance is the 50th Vice President of the United
                  States, serving alongside President Donald J. Trump. Born in
                  Middletown, Ohio, Vance grew up in a working-class family and
                  served in the U.S. Marine Corps. He graduated from Ohio State
                  University and Yale Law School, where he became a bestselling
                  author with his memoir "Hillbilly Elegy," which chronicled his
                  Appalachian upbringing and the struggles of the white working
                  class.
                </p>
                <p>
                  Vance entered politics in 2021, winning a seat in the U.S.
                  Senate from Ohio as a Republican. Known for his moderate
                  stance on some issues and his focus on economic populism,
                  Vance advocated for policies to address opioid addiction,
                  manufacturing decline, and rural poverty. He was selected by
                  Donald Trump as his running mate in the 2024 presidential
                  election, helping to secure victory and becoming Vice
                  President on January 20, 2025.
                </p>
                <p>
                  As Vice President, Vance is expected to play a key role in
                  domestic policy, particularly in areas related to economic
                  development, veterans' affairs, and bridging divides in
                  American society. His background and experiences make him a
                  unique voice in the administration.
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
                        50th Vice President
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
                        U.S. Senator
                      </div>
                    </div>
                  </div>
                  <div className={styles.termLabel}>
                    <div className={styles.termState}>Ohio</div>
                    <div className={styles.termYears}>2023 - 2025</div>
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
              <h3 className={styles.sectionTitle}>Key Responsibilities</h3>
              <div className={styles.financesContent}>
                <p>
                  As Vice President, J.D. Vance oversees several key areas of
                  focus that align with the Trump administration's priorities:
                </p>
                <ul>
                  <li>
                    <strong>Economic Development:</strong> Leading initiatives
                    to revitalize manufacturing and create jobs in rural and
                    working-class communities.
                  </li>
                  <li>
                    <strong>Veterans Affairs:</strong> Advocating for improved
                    support and services for military veterans and their
                    families.
                  </li>
                  <li>
                    <strong>Opioid Crisis Response:</strong> Coordinating
                    federal efforts to combat drug addiction and provide
                    treatment resources.
                  </li>
                  <li>
                    <strong>Educational Reform:</strong> Promoting policies to
                    make higher education more accessible and address student
                    debt issues.
                  </li>
                  <li>
                    <strong>National Unity:</strong> Working to bridge political
                    divides and foster dialogue across different segments of
                    society.
                  </li>
                  <li>
                    <strong>Foreign Policy Support:</strong> Assisting in
                    international relations, particularly with allies in Europe
                    and Asia.
                  </li>
                </ul>
                <p>
                  As the administration develops specific policies and
                  legislation, this section will be updated with detailed
                  responsibilities and progress reports.
                </p>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}

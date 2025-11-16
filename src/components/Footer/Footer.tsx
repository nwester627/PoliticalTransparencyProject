"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.title}>Political Transparency Project</div>
          <div className={styles.tagline}>
            Making government easier to understand
          </div>
        </div>

        <nav className={styles.grid} aria-label="Site links">
          <div className={styles.col}>
            <div className={styles.colTitle}>Product</div>
            <Link
              href="/levers"
              className={styles.link}
              aria-label="Levers of power"
            >
              Levers of Power
            </Link>
            <Link
              href="/about"
              className={styles.link}
              aria-label="About this project"
            >
              About
            </Link>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>Resources</div>
            <a
              href="https://www.usa.gov/register-to-vote"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="US government voter registration"
            >
              Voter Registration
            </a>
            <a
              href="https://www.congress.gov"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Congress website"
            >
              Congress.gov
            </a>
            <a
              href="/privacy"
              className={styles.link}
              aria-label="Privacy policy"
            >
              Privacy
            </a>
          </div>

          <div className={`${styles.col} ${styles.socialCol}`}>
            <div className={styles.colTitle}>Connect</div>
            <div className={styles.socials}>
              <a
                className={styles.iconLink}
                href="https://github.com/nwester627/PoliticalTransparencyProject"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FaGithub aria-hidden="true" />
              </a>
              <a
                className={styles.iconLink}
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <FaTwitter aria-hidden="true" />
              </a>
              <a
                className={styles.iconLink}
                href="mailto:hello@politicalproject.example"
                aria-label="Email"
              >
                <FaEnvelope aria-hidden="true" />
              </a>
            </div>
          </div>
        </nav>
      </div>

      <div className={styles.credit}>
        <div>© {new Date().getFullYear()} Political Transparency Project.</div>
        <div>
          <small>
            Built with care. <Link href="/terms">Terms</Link>
          </small>
        </div>
      </div>
    </footer>
  );
}

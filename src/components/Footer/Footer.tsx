"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";
import { FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const el = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = el.current || document.querySelector("footer");
    const setFooterHeight = () => {
      const height = node ? Math.ceil(node.getBoundingClientRect().height) : 0;
      const value = height ? `${height + 8}px` : "8rem";
      document.documentElement.style.setProperty("--footer-height", value);
    };

    setFooterHeight();

    // Watch for footer size changes. ResizeObserver is well supported in modern browsers.
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && node) {
      ro = new ResizeObserver(setFooterHeight);
      ro.observe(node as Element);
    }

    // Also update on window resize as a fallback.
    window.addEventListener("resize", setFooterHeight);

    return () => {
      window.removeEventListener("resize", setFooterHeight);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <footer ref={el as any} className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.title}>Political Transparency Project</div>
          <div className={styles.tagline}>
            Making government easier to understand
          </div>
        </div>

        <nav className={styles.grid} aria-label="Site links">
          <div className={styles.col}>
            <div className={styles.colTitle}>Explore</div>
            <Link
              href="/members"
              className={styles.link}
              aria-label="Browse congressional members"
            >
              Members
            </Link>
            <Link
              href="/register"
              className={styles.link}
              aria-label="Register to vote"
            >
              Register to Vote
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
              href="https://www.fec.gov"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Federal Election Commission"
            >
              FEC.gov
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
          <small>Built with care.</small>
        </div>
      </div>
    </footer>
  );
}

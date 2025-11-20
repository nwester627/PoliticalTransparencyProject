"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Header.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Handle Escape and focus trap when menu is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        prevFocusRef.current?.focus();
      }

      if (e.key === "Tab" && open && navRef.current) {
        const focusable = navRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement | null;
      window.addEventListener("keydown", onKey);
      // focus first link
      setTimeout(() => {
        const first = navRef.current?.querySelector<HTMLElement>("a, button");
        first?.focus();
      }, 0);
    }

    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="Political Transparency Project"
        >
          <Image
            src="/assets/PTP_logo.png"
            alt="Political Transparency Project"
            width={216}
            height={216}
            className={styles.brandLogo}
            quality={100}
            priority
            sizes="(max-width:640px) 96px, (max-width:968px) 140px, 216px"
            unoptimized
          />
        </Link>
        <button
          className={styles.menuButton}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
        {/* Desktop nav (always rendered on larger screens) */}
        <nav
          className={`${styles.nav} ${styles.desktopNav}`}
          aria-label="Main navigation desktop"
        >
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/members" className={styles.navLink}>
            Members
          </Link>
          {/* Elections removed */}
          <Link href="/donations" className={styles.navLink}>
            Donations
          </Link>
          <Link href="/bills" className={styles.navLink}>
            Bills
          </Link>
        </nav>

        {/* Mobile nav (animated panel) */}
        <AnimatePresence>
          {open && (
            <motion.nav
              ref={navRef}
              className={styles.nav}
              aria-label="Main navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <button
                className={styles.closeButton}
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
              <Link
                href="/"
                className={styles.navLink}
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/members"
                className={styles.navLink}
                onClick={() => setOpen(false)}
              >
                Members
              </Link>
              {/* Elections removed */}
              <Link
                href="/donations"
                className={styles.navLink}
                onClick={() => setOpen(false)}
              >
                Donations
              </Link>
              <Link
                href="/bills"
                className={styles.navLink}
                onClick={() => setOpen(false)}
              >
                Bills
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* backdrop for mobile menu (below nav panel) */}
        {open && (
          <div
            className={styles.mobileOverlay}
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    </header>
  );
}

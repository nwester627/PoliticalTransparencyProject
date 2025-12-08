"use client";

import Header from "@/components/Header/Header";
import UnderConstruction from "@/components/UnderConstruction/UnderConstruction";
import styles from "./page.module.css";
import IndustryDonut from "@/components/DonationsViz/IndustryDonut";
import { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/numberFormat";

function DonationsPageContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParty, setSelectedParty] = useState<"ALL" | "DEM" | "REP">(
    "ALL"
  );
  const [partyLoading, setPartyLoading] = useState(false);
  const loadedPartiesRef = useRef<Set<string>>(new Set());

  // Initial load: fetch base dataset (no heavy per-party aggregation)
  useEffect(() => {
    async function fetchBase() {
      setLoading(true);
      try {
        const res = await fetch("/api/donations");
        if (!res.ok) throw new Error("Failed to fetch data");
        const result = await res.json();
        console.debug("/api/donations result:", result);
        setData(result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchBase();
  }, []);

  // Lazy-load detailed party-level aggregates when the user selects a specific party
  // Track loaded parties in a ref to avoid re-fetching when we merge results into `data`.
  useEffect(() => {
    if (selectedParty === "ALL") return;
    const partyKey = selectedParty;
    if (loadedPartiesRef.current.has(partyKey)) return;
    let mounted = true;
    async function fetchPartyDetail() {
      setPartyLoading(true);
      try {
        const url = `/api/donations?party=${encodeURIComponent(
          partyKey
        )}&detail=true`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch party details");
        const result = await res.json();
        if (!mounted) return;
        // Merge the returned party detail into existing data
        setData((prev: any) => ({ ...prev, ...result }));
        loadedPartiesRef.current.add(partyKey);
      } catch (err) {
        console.warn("Party detail fetch failed:", err);
      } finally {
        if (mounted) setPartyLoading(false);
      }
    }
    fetchPartyDetail();
    return () => {
      mounted = false;
    };
  }, [selectedParty]);

  if (loading)
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Loading campaign finance data...
            </div>
          </div>
        </main>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
              Error: {error}
            </div>
          </div>
        </main>
      </>
    );

  const { topContributors, topIndustries, topCandidates, totals, meta } = data;

  // Process industries for display; prefer party-specific data when provided by the API
  const industriesSource =
    data?.topIndustriesByParty?.[
      selectedParty === "ALL" ? "ALL" : selectedParty
    ] ?? topIndustries;

  const industries = (industriesSource || [])
    .slice(0, 6)
    .map((industry: any, index: number) => ({
      name: industry.name || "Unknown",
      amount: Number(industry.amount) || 0,
      percentage: totals.totalRaised
        ? Math.round((Number(industry.amount) / totals.totalRaised) * 100)
        : 0,
    }));

  // Process candidates for display
  const members = topCandidates
    .slice(0, 10)
    .map((candidate: any, index: number) => ({
      id: index + 1,
      member: `${candidate.name} (${candidate.party}-${candidate.state})`,
      totalRaised: candidate.receipts,
      topDonor: topContributors[0]?.name || "N/A",
      donorAmount: topContributors[0]?.amount || 0,
      industry: "Various",
      candidate_id: candidate.candidate_id,
    }));

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Campaign Finance & Donations</h1>
          <p className={styles.pageDescription}>
            Track campaign contributions, top donors, and industry spending
            patterns. Analyze the money flow in politics with comprehensive
            donation data from the Federal Election Commission.
          </p>

          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Search by member name or donor..."
              className={styles.searchInput}
            />
            <select className={styles.filterSelect}>
              <option>All Time Periods</option>
              <option>Current Cycle</option>
              <option>Last Cycle</option>
              <option>2024</option>
              <option>2022</option>
            </select>
            <select className={styles.filterSelect}>
              <option>All Industries</option>
              <option>Technology</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>Energy</option>
            </select>
          </div>

          <div className={styles.topSection}>
            <div className={styles.industryBreakdown}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setSelectedParty("ALL")}
                    aria-pressed={selectedParty === "ALL"}
                    className={
                      selectedParty === "ALL"
                        ? styles.partyButtonActive
                        : styles.partyButton
                    }
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedParty("DEM")}
                    aria-pressed={selectedParty === "DEM"}
                    className={
                      selectedParty === "DEM"
                        ? styles.partyButtonActive
                        : styles.partyButton
                    }
                  >
                    DEM
                  </button>
                  <button
                    onClick={() => setSelectedParty("REP")}
                    aria-pressed={selectedParty === "REP"}
                    className={
                      selectedParty === "REP"
                        ? styles.partyButtonActive
                        : styles.partyButton
                    }
                  >
                    REP
                  </button>
                </div>
                {selectedParty !== "ALL" && (
                  <div style={{ fontSize: 12, color: "#92400e" }}>
                    {partyLoading
                      ? "Loading party-level breakdown..."
                      : data?.topIndustriesByParty
                      ? null
                      : "⚠️ Party-level breakdown not available; showing overall industries"}
                  </div>
                )}
              </div>

              <IndustryDonut
                industries={industries}
                totalRaised={totals.totalRaised}
              />
              {meta?.source === "mock" && (
                <div style={{ marginTop: 8, color: "#92400e", fontSize: 12 }}>
                  ⚠️ Showing example/mock data (FEC unavailable)
                </div>
              )}
            </div>

            <div className={styles.statsCard}>
              <h2 className={styles.sectionTitle}>Total Overview</h2>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Raised</span>
                  <span className={styles.statValue}>
                    {formatCurrency(totals.totalRaised, {
                      compact: true,
                      digits: 0,
                    })}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Spent</span>
                  <span className={styles.statValue}>
                    {formatCurrency(totals.totalSpent, {
                      compact: true,
                      digits: 0,
                    })}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Avg Donation</span>
                  <span className={styles.statValue}>
                    {formatCurrency(Math.round(totals.avgDonation))}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Top Contributors</span>
                  <span className={styles.statValue}>
                    {topContributors.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Top Fundraisers</h2>
          <div className={styles.membersList}>
            {members.map((item: any) => (
              <div key={item.id} className={styles.memberCard}>
                <div className={styles.memberHeader}>
                  <h3 className={styles.memberName}>{item.member}</h3>
                  <div className={styles.totalRaised}>
                    {formatCurrency(item.totalRaised, {
                      compact: true,
                      digits: 2,
                    })}
                  </div>
                </div>

                <div className={styles.donorInfo}>
                  <div className={styles.donorLabel}>Top Donor</div>
                  <div className={styles.donorDetails}>
                    <span className={styles.donorName}>{item.topDonor}</span>
                    <span className={styles.donorAmount}>
                      {formatCurrency(item.donorAmount, {
                        compact: true,
                        digits: 0,
                      })}
                    </span>
                  </div>
                  <div className={styles.industryTag}>{item.industry}</div>
                </div>

                <div className={styles.timeline}>
                  <h4>Cash on Hand</h4>
                  <div className={styles.timelinePlaceholder}>
                    <div className={styles.cashDisplay}>
                      {formatCurrency(
                        topCandidates.find(
                          (c: any) => c.name === item.member.split(" (")[0]
                        )?.cash_on_hand || 0
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={`https://www.fec.gov/data/candidate/${item.candidate_id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewDetailsButton}
                >
                  View FEC Details
                </a>
              </div>
            ))}
          </div>

          <div className={styles.dataSource}>
            <p>📊 Data sourced from Federal Election Commission filings</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default function DonationsPage() {
  return <DonationsPageContent />;
}

"use client";

import Header from "@/components/Header/Header";
import UnderConstruction from "@/components/UnderConstruction/UnderConstruction";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

function DonationsPageContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/donations");
        if (!res.ok) throw new Error("Failed to fetch data");
        const result = await res.json();
        setData(result);
      } catch (err) {
        // `err` is `unknown` in TypeScript; normalize to a string message
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  const { topContributors, topIndustries, topCandidates, totals } = data;

  // Process industries for display
  const industries = topIndustries
    .slice(0, 6)
    .map((industry: any, index: number) => ({
      name: industry.name || "Unknown",
      amount: industry.amount,
      percentage: Math.round((industry.amount / totals.totalRaised) * 100),
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
              <h2 className={styles.sectionTitle}>
                Top Industries by Contribution
              </h2>
              <div className={styles.industryList}>
                {industries.map((industry, index) => (
                  <div key={index} className={styles.industryItem}>
                    <div className={styles.industryHeader}>
                      <span className={styles.industryName}>
                        {industry.name}
                      </span>
                      <span className={styles.industryAmount}>
                        ${(industry.amount / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${industry.percentage}%` }}
                      >
                        {industry.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.statsCard}>
              <h2 className={styles.sectionTitle}>Total Overview</h2>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Raised</span>
                  <span className={styles.statValue}>
                    ${(totals.totalRaised / 1000000).toFixed(0)}M
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Spent</span>
                  <span className={styles.statValue}>
                    ${(totals.totalSpent / 1000000).toFixed(0)}M
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Avg Donation</span>
                  <span className={styles.statValue}>
                    ${Math.round(totals.avgDonation)}
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
            {members.map((item) => (
              <div key={item.id} className={styles.memberCard}>
                <div className={styles.memberHeader}>
                  <h3 className={styles.memberName}>{item.member}</h3>
                  <div className={styles.totalRaised}>
                    ${(item.totalRaised / 1000000).toFixed(2)}M
                  </div>
                </div>

                <div className={styles.donorInfo}>
                  <div className={styles.donorLabel}>Top Donor</div>
                  <div className={styles.donorDetails}>
                    <span className={styles.donorName}>{item.topDonor}</span>
                    <span className={styles.donorAmount}>
                      ${(item.donorAmount / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className={styles.industryTag}>{item.industry}</div>
                </div>

                <div className={styles.timeline}>
                  <h4>Cash on Hand</h4>
                  <div className={styles.timelinePlaceholder}>
                    <div className={styles.cashDisplay}>
                      $
                      {(
                        topCandidates.find(
                          (c: any) => c.name === item.member.split(" (")[0]
                        )?.cash_on_hand / 1000000 || 0
                      ).toFixed(2)}
                      M
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

import Header from "@/components/Header/Header";
import UnderConstruction from "@/components/UnderConstruction/UnderConstruction";
import styles from "./page.module.css";

export function OriginalDonationsPage() {
  // Placeholder data - will be replaced with API data
  const placeholderDonations = [
    {
      id: 1,
      member: "Senator John Doe",
      totalRaised: 5420000,
      topDonor: "Tech Industries PAC",
      donorAmount: 250000,
      industry: "Technology",
    },
    {
      id: 2,
      member: "Rep. Jane Smith",
      totalRaised: 3850000,
      topDonor: "Energy Solutions Group",
      donorAmount: 180000,
      industry: "Energy",
    },
    {
      id: 3,
      member: "Senator Bob Johnson",
      totalRaised: 4100000,
      topDonor: "Healthcare United",
      donorAmount: 220000,
      industry: "Healthcare",
    },
  ];

  const placeholderIndustries = [
    { name: "Technology", amount: 15000000, percentage: 25 },
    { name: "Healthcare", amount: 12000000, percentage: 20 },
    { name: "Finance", amount: 10000000, percentage: 17 },
    { name: "Energy", amount: 8000000, percentage: 13 },
    { name: "Defense", amount: 7000000, percentage: 12 },
    { name: "Other", amount: 8000000, percentage: 13 },
  ];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Campaign Finance & Donations</h1>
          <p className={styles.pageDescription}>
            Track campaign contributions, top donors, and industry spending
            patterns. Analyze the money flow in politics with comprehensive
            donation data.
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
                {placeholderIndustries.map((industry, index) => (
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
                  <span className={styles.statValue}>$60M</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Unique Donors</span>
                  <span className={styles.statValue}>45,320</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Avg Donation</span>
                  <span className={styles.statValue}>$1,324</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>PAC Contributions</span>
                  <span className={styles.statValue}>$18M</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Member Campaign Finance</h2>
          <div className={styles.membersList}>
            {placeholderDonations.map((item) => (
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
                  <h4>Contribution Timeline</h4>
                  <div className={styles.timelinePlaceholder}>
                    <div className={styles.timelineBar}>
                      <div
                        className={styles.timelineSegment}
                        style={{ width: "30%" }}
                      ></div>
                      <div
                        className={styles.timelineSegment}
                        style={{ width: "45%" }}
                      ></div>
                      <div
                        className={styles.timelineSegment}
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                    <div className={styles.timelineLabels}>
                      <span>Q1</span>
                      <span>Q2</span>
                      <span>Q3</span>
                      <span>Q4</span>
                    </div>
                  </div>
                </div>

                <button className={styles.viewDetailsButton}>
                  View All Donors & Details
                </button>
              </div>
            ))}
          </div>

          <div className={styles.placeholderNote}>
            <p>💰 Data will be sourced from OpenSecrets API and FEC filings</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default function DonationsPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <UnderConstruction
            title="Campaign Finance & Donations"
            message="This section is under construction. We'll restore full data and tools soon."
          />
        </div>
      </main>
    </>
  );
}

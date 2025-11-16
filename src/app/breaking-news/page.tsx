import Header from "@/components/Header/Header";
import UnderConstruction from "@/components/UnderConstruction/UnderConstruction";
import styles from "./page.module.css";

function OriginalBreakingNewsPage() {
  // Placeholder data - will be replaced with API data
  const placeholderNews = [
    {
      id: 1,
      title: "8 Democrats Cross the Aisle to End Government Shutdown",
      summary:
        "In a surprising bipartisan move, eight Democratic senators joined Republicans to pass a continuing resolution, averting a government shutdown with just hours to spare.",
      timestamp: "2 hours ago",
      category: "Breaking",
      impact: "High",
      members: ["Sen. Joe Manchin", "Sen. Kyrsten Sinema", "Sen. Jon Tester"],
      related: "H.R. 9999 - Continuing Resolution",
    },
    {
      id: 2,
      title: "House Passes Historic Climate Legislation",
      summary:
        "The House of Representatives approved a comprehensive climate bill with a vote of 225-210, marking the most significant environmental legislation in decades.",
      timestamp: "5 hours ago",
      category: "Legislation",
      impact: "High",
      members: ["Rep. Alexandria Ocasio-Cortez", "Rep. Kathy Castor"],
      related: "H.R. 5678 - Climate Action Act",
    },
    {
      id: 3,
      title: "Senate Confirms New Supreme Court Justice",
      summary:
        "The Senate voted 52-48 to confirm Judge Sarah Martinez to the Supreme Court, filling a vacancy that had been open for six months.",
      timestamp: "1 day ago",
      category: "Judiciary",
      impact: "Critical",
      members: ["Sen. Dick Durbin", "Sen. Chuck Grassley"],
      related: "Supreme Court Nomination",
    },
    {
      id: 4,
      title: "Bipartisan Infrastructure Deal Reaches Final Vote",
      summary:
        "After months of negotiations, the bipartisan infrastructure package is set for a final vote next week, with strong support from both parties.",
      timestamp: "1 day ago",
      category: "Infrastructure",
      impact: "High",
      members: ["Sen. Rob Portman", "Sen. Kyrsten Sinema"],
      related: "S. 1234 - Infrastructure Investment Act",
    },
    {
      id: 5,
      title: "House Speaker Announces Committee Assignments",
      summary:
        "Major committee reshuffles announced today, with several high-profile members moving to new leadership positions.",
      timestamp: "2 days ago",
      category: "Congress",
      impact: "Medium",
      members: ["Speaker Mike Johnson"],
      related: "Committee Assignments",
    },
  ];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span className={styles.breakingIcon}>🔴</span> Breaking Political
              News
            </h1>
            <p className={styles.pageDescription}>
              Stay informed with real-time updates on congressional actions,
              votes, and major political developments.
            </p>
          </div>

          <div className={styles.filtersBar}>
            <select className={styles.filterSelect}>
              <option>All Categories</option>
              <option>Breaking</option>
              <option>Legislation</option>
              <option>Judiciary</option>
              <option>Infrastructure</option>
              <option>Congress</option>
            </select>
            <select className={styles.filterSelect}>
              <option>All Impact Levels</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className={styles.filterSelect}>
              <option>Last 24 Hours</option>
              <option>Last Week</option>
              <option>Last Month</option>
              <option>All Time</option>
            </select>
          </div>

          <div className={styles.newsFeed}>
            {placeholderNews.map((news) => (
              <article key={news.id} className={styles.newsCard}>
                <div className={styles.newsHeader}>
                  <div className={styles.badges}>
                    <span
                      className={`${styles.categoryBadge} ${
                        styles[news.category.toLowerCase()]
                      }`}
                    >
                      {news.category}
                    </span>
                    <span
                      className={`${styles.impactBadge} ${
                        styles[news.impact.toLowerCase()]
                      }`}
                    >
                      {news.impact} Impact
                    </span>
                  </div>
                  <span className={styles.timestamp}>{news.timestamp}</span>
                </div>

                <h2 className={styles.newsTitle}>{news.title}</h2>
                <p className={styles.newsSummary}>{news.summary}</p>

                <div className={styles.newsMetadata}>
                  <div className={styles.membersInvolved}>
                    <span className={styles.metaLabel}>Key Members:</span>
                    <div className={styles.membersList}>
                      {news.members.map((member, index) => (
                        <span key={index} className={styles.memberTag}>
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>

                  {news.related && (
                    <div className={styles.relatedInfo}>
                      <span className={styles.metaLabel}>Related:</span>
                      <span className={styles.relatedLink}>{news.related}</span>
                    </div>
                  )}
                </div>

                <div className={styles.newsActions}>
                  <button className={styles.actionButton}>
                    Read Full Story
                  </button>
                  <button className={styles.actionButton}>
                    View Related Bills
                  </button>
                  <button className={styles.shareButton}>Share</button>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.alertsSection}>
            <h3 className={styles.alertsTitle}>Set Up News Alerts</h3>
            <p className={styles.alertsDescription}>
              Get notified about important political developments that matter to
              you.
            </p>
            <div className={styles.alertsOptions}>
              <label className={styles.alertOption}>
                <input type="checkbox" />
                <span>Breaking Legislative News</span>
              </label>
              <label className={styles.alertOption}>
                <input type="checkbox" />
                <span>Major Votes & Roll Calls</span>
              </label>
              <label className={styles.alertOption}>
                <input type="checkbox" />
                <span>Committee Announcements</span>
              </label>
              <label className={styles.alertOption}>
                <input type="checkbox" />
                <span>Supreme Court Updates</span>
              </label>
            </div>
            <button className={styles.subscribeButton}>
              Subscribe to Alerts
            </button>
          </div>

          <div className={styles.placeholderNote}>
            <p>
              📰 News data will be aggregated from multiple sources including
              Congressional press releases and political news APIs
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default function BreakingNewsPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <UnderConstruction
            title="Breaking News"
            message="News aggregation is temporarily paused while we improve the feed. Check back soon."
          />
        </div>
      </main>
    </>
  );
}

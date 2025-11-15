import Header from "@/components/Header/Header";
import PageHeader from "@/components/UI/PageHeader/PageHeader";
import SearchBar from "@/components/UI/SearchBar/SearchBar";
import FilterBar from "@/components/UI/FilterBar/FilterBar";
import PlaceholderNote from "@/components/UI/PlaceholderNote/PlaceholderNote";
import Card from "@/components/UI/Card/Card";
import styles from "./page.module.css";

export default function ElectionsPage() {
  // Placeholder data - will be replaced with API data
  const placeholderElections = [
    {
      id: 1,
      type: "Presidential",
      year: 2024,
      date: "November 5, 2024",
      status: "Completed",
      candidates: ["Joe Biden", "Donald Trump"],
      winner: "Donald Trump",
      turnout: "66.7%",
    },
    {
      id: 2,
      type: "Senate",
      year: 2024,
      date: "November 5, 2024",
      status: "Completed",
      seatsUp: 34,
      results: "Republicans gained control",
      keyRaces: ["Pennsylvania", "Wisconsin", "Arizona"],
    },
    {
      id: 3,
      type: "House",
      year: 2024,
      date: "November 5, 2024",
      status: "Completed",
      seatsUp: 435,
      results: "Republicans gained majority",
      keyRaces: ["Speaker race", "Key districts"],
    },
    {
      id: 4,
      type: "Presidential",
      year: 2028,
      date: "November 3, 2028",
      status: "Upcoming",
      candidates: ["TBD"],
      projectedTurnout: "65-70%",
    },
  ];

  const filters = [
    {
      name: "electionType",
      options: [
        { label: "All Types", value: "all" },
        { label: "Presidential", value: "presidential" },
        { label: "Senate", value: "senate" },
        { label: "House", value: "house" },
        { label: "Gubernatorial", value: "gubernatorial" },
        { label: "State Legislature", value: "state" },
      ],
    },
    {
      name: "year",
      options: [
        { label: "All Years", value: "all" },
        { label: "2024", value: "2024" },
        { label: "2026", value: "2026" },
        { label: "2028", value: "2028" },
        { label: "2030", value: "2030" },
      ],
    },
    {
      name: "status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Upcoming", value: "upcoming" },
        { label: "In Progress", value: "inprogress" },
        { label: "Completed", value: "completed" },
      ],
    },
    {
      name: "sort",
      options: [
        { label: "Sort: Most Recent", value: "recent" },
        { label: "Sort: By Date", value: "date" },
        { label: "Sort: By Type", value: "type" },
      ],
    },
  ];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <PageHeader
            title="Elections & Campaigns"
            description="Track election results, candidate information, campaign finance data, and voting patterns. Stay informed about upcoming elections and historical election data."
          />

          <Card className={styles.searchSection}>
            <SearchBar
              placeholder="Search by candidate, election year, or state..."
              showButton
            />
            <FilterBar filters={filters} />
          </Card>

          <div className={styles.electionsList}>
            {placeholderElections.map((election) => (
              <Card key={election.id} className={styles.electionCard}>
                <div className={styles.electionHeader}>
                  <div className={styles.electionType}>
                    <span className={styles.typeBadge}>{election.type}</span>
                    <span className={styles.year}>{election.year}</span>
                  </div>
                  <div className={styles.electionStatus}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[election.status.toLowerCase()]
                      }`}
                    >
                      {election.status}
                    </span>
                  </div>
                </div>

                <div className={styles.electionContent}>
                  <h3 className={styles.electionTitle}>
                    {election.type} Election - {election.year}
                  </h3>
                  <p className={styles.electionDate}>📅 {election.date}</p>

                  {election.winner && (
                    <p className={styles.electionWinner}>
                      🏆 Winner: {election.winner}
                    </p>
                  )}

                  {election.turnout && (
                    <p className={styles.electionTurnout}>
                      📊 Voter Turnout: {election.turnout}
                    </p>
                  )}

                  {election.seatsUp && (
                    <p className={styles.electionSeats}>
                      🪑 Seats Up: {election.seatsUp}
                    </p>
                  )}

                  {election.results && (
                    <p className={styles.electionResults}>
                      📈 Results: {election.results}
                    </p>
                  )}

                  {election.keyRaces && (
                    <div className={styles.keyRaces}>
                      <h4>Key Races:</h4>
                      <ul>
                        {election.keyRaces.map((race, index) => (
                          <li key={index}>{race}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {election.candidates && (
                    <div className={styles.candidates}>
                      <h4>Candidates:</h4>
                      <ul>
                        {election.candidates.map((candidate, index) => (
                          <li key={index}>{candidate}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className={styles.electionActions}>
                  <button className={styles.actionButton}>View Details</button>
                  <button className={styles.actionButton}>
                    Campaign Finance
                  </button>
                  <button className={styles.actionButton}>Voting Data</button>
                </div>
              </Card>
            ))}
          </div>

          <div className={styles.pagination}>
            <button className={styles.pageButton}>Previous</button>
            <div className={styles.pageNumbers}>
              <button className={`${styles.pageNumber} ${styles.active}`}>
                1
              </button>
              <button className={styles.pageNumber}>2</button>
              <button className={styles.pageNumber}>3</button>
            </div>
            <button className={styles.pageButton}>Next</button>
          </div>

          <PlaceholderNote>
            <p>
              🗳️ Election data will be sourced from FEC.gov, state election
              boards, and Vote.org
            </p>
          </PlaceholderNote>
        </div>
      </main>
    </>
  );
}

import Header from "@/components/Header/Header";
import PageHeader from "@/components/UI/PageHeader/PageHeader";
import SearchBar from "@/components/UI/SearchBar/SearchBar";
import FilterBar from "@/components/UI/FilterBar/FilterBar";
import VoteCard from "@/components/Voting/VoteCard/VoteCard";
import PlaceholderNote from "@/components/UI/PlaceholderNote/PlaceholderNote";
import Card from "@/components/UI/Card/Card";
import styles from "./page.module.css";

export default function VotingRecordsPage() {
  // Placeholder data - will be replaced with API data
  const placeholderVotes = [
    {
      id: 1,
      bill: "H.R. 1234",
      title: "Infrastructure Investment Act",
      date: "2024-03-15",
      chamber: "House",
      result: "Passed",
      yesVotes: 235,
      noVotes: 200,
      partyAlignment: { D: 95, R: 45, I: 100 },
    },
    {
      id: 2,
      bill: "S. 5678",
      title: "Healthcare Reform Bill",
      date: "2024-03-10",
      chamber: "Senate",
      result: "Failed",
      yesVotes: 48,
      noVotes: 52,
      partyAlignment: { D: 98, R: 2, I: 50 },
    },
    {
      id: 3,
      bill: "H.R. 9012",
      title: "Education Funding Authorization",
      date: "2024-03-08",
      chamber: "House",
      result: "Passed",
      yesVotes: 268,
      noVotes: 167,
      partyAlignment: { D: 100, R: 35, I: 100 },
    },
  ];

  const filters = [
    {
      name: "chamber",
      options: [
        { label: "All Chambers", value: "all" },
        { label: "House", value: "house" },
        { label: "Senate", value: "senate" },
      ],
    },
    {
      name: "result",
      options: [
        { label: "All Results", value: "all" },
        { label: "Passed", value: "passed" },
        { label: "Failed", value: "failed" },
      ],
    },
  ];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <PageHeader
            title="Voting Records & Roll Call"
            description="Explore congressional voting history with detailed roll-call records. Search by date, bill number, keywords, and analyze voting patterns and party alignment."
          />

          <Card className={styles.searchSection}>
            <SearchBar
              placeholder="Search by bill number, keyword, or topic..."
              showButton
            />
            <div className={styles.dateFilters}>
              <input
                type="date"
                className={styles.dateInput}
                placeholder="Start Date"
              />
              <input
                type="date"
                className={styles.dateInput}
                placeholder="End Date"
              />
            </div>
            <FilterBar filters={filters} />
          </Card>

          <div className={styles.votesList}>
            {placeholderVotes.map((vote) => (
              <VoteCard
                key={vote.id}
                bill={vote.bill}
                title={vote.title}
                date={vote.date}
                result={vote.result}
                yesVotes={vote.yesVotes}
                noVotes={vote.noVotes}
                partyAlignment={vote.partyAlignment}
              />
            ))}
          </div>

          <PlaceholderNote>
            <p>
              📊 Voting data will be sourced from ProPublica Congress API and
              GovTrack
            </p>
          </PlaceholderNote>
        </div>
      </main>
    </>
  );
}

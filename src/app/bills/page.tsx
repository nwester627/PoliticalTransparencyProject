import Header from "@/components/Header/Header";
import UnderConstruction from "@/components/UnderConstruction/UnderConstruction";
import PageHeader from "@/components/UI/PageHeader/PageHeader";
import SearchBar from "@/components/UI/SearchBar/SearchBar";
import FilterBar from "@/components/UI/FilterBar/FilterBar";
import BillCard from "@/components/Bills/BillCard/BillCard";
import PlaceholderNote from "@/components/UI/PlaceholderNote/PlaceholderNote";
import Card from "@/components/UI/Card/Card";
import styles from "./page.module.css";

function OriginalBillsPage() {
  // Placeholder data - will be replaced with API data
  const placeholderBills = [
    {
      id: 1,
      number: "H.R. 1234",
      title: "Infrastructure Investment and Jobs Act",
      sponsor: "Rep. John Doe (D-CA)",
      status: "Passed House",
      introduced: "2024-01-15",
      lastAction: "2024-03-10",
      subjects: ["Infrastructure", "Transportation", "Jobs"],
      appropriation: "$1.2 Trillion",
    },
    {
      id: 2,
      number: "S. 5678",
      title: "National Healthcare Reform Act",
      sponsor: "Sen. Jane Smith (R-TX)",
      status: "In Committee",
      introduced: "2024-02-01",
      lastAction: "2024-03-05",
      subjects: ["Healthcare", "Insurance", "Medicare"],
      appropriation: "$850 Billion",
    },
    {
      id: 3,
      number: "H.R. 9012",
      title: "Education Funding Authorization",
      sponsor: "Rep. Bob Johnson (D-NY)",
      status: "Passed Both",
      introduced: "2024-01-20",
      lastAction: "2024-03-12",
      subjects: ["Education", "K-12", "Higher Education"],
      appropriation: "$120 Billion",
    },
    {
      id: 4,
      number: "S. 3456",
      title: "Climate Action and Energy Security Act",
      sponsor: "Sen. Sarah Williams (D-CA)",
      status: "Senate Floor",
      introduced: "2024-02-15",
      lastAction: "2024-03-08",
      subjects: ["Climate", "Energy", "Environment"],
      appropriation: "$2.0 Trillion",
    },
  ];

  const filters = [
    {
      name: "status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Introduced", value: "introduced" },
        { label: "In Committee", value: "committee" },
        { label: "House Floor", value: "housefloor" },
        { label: "Senate Floor", value: "senatefloor" },
        { label: "Passed House", value: "passedhouse" },
        { label: "Passed Senate", value: "passedsenate" },
        { label: "Passed Both", value: "passedboth" },
        { label: "Became Law", value: "becamelaw" },
        { label: "Vetoed", value: "vetoed" },
      ],
    },
    {
      name: "chamber",
      options: [
        { label: "All Chambers", value: "all" },
        { label: "House", value: "house" },
        { label: "Senate", value: "senate" },
      ],
    },
    {
      name: "subject",
      options: [
        { label: "All Subjects", value: "all" },
        { label: "Healthcare", value: "healthcare" },
        { label: "Education", value: "education" },
        { label: "Infrastructure", value: "infrastructure" },
        { label: "Defense", value: "defense" },
        { label: "Climate", value: "climate" },
        { label: "Economy", value: "economy" },
      ],
    },
    {
      name: "sort",
      options: [
        { label: "Sort: Most Recent", value: "recent" },
        { label: "Sort: Oldest First", value: "oldest" },
        { label: "Sort: Bill Number", value: "billnumber" },
      ],
    },
  ];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <PageHeader
            title="Bills & Legislation"
            description="Search and track federal legislation, view bill status, sponsors, related appropriations, and continuing resolution language. Stay up to date with congressional activity."
          />

          <Card className={styles.searchSection}>
            <SearchBar
              placeholder="Search by bill number, keyword, or topic..."
              showButton
            />
            <FilterBar filters={filters} />
          </Card>

          <div className={styles.billsList}>
            {placeholderBills.map((bill) => (
              <BillCard
                key={bill.id}
                number={bill.number}
                title={bill.title}
                sponsor={bill.sponsor}
                status={bill.status}
                introduced={bill.introduced}
                lastAction={bill.lastAction}
                subjects={bill.subjects}
                appropriation={bill.appropriation}
              />
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
              <button className={styles.pageNumber}>4</button>
              <button className={styles.pageNumber}>5</button>
            </div>
            <button className={styles.pageButton}>Next</button>
          </div>

          <PlaceholderNote>
            <p>
              📜 Legislative data will be sourced from Congress.gov API and
              GovTrack
            </p>
          </PlaceholderNote>
        </div>
      </main>
    </>
  );
}

export default function BillsPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <UnderConstruction
            title="Bills & Legislation"
            message="This area is under construction — full bill search and tracking will return soon."
          />
        </div>
      </main>
    </>
  );
}

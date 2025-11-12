import Header from "@/components/Header/Header";
import PageHeader from "@/components/UI/PageHeader/PageHeader";
import SearchBar from "@/components/UI/SearchBar/SearchBar";
import FilterBar from "@/components/UI/FilterBar/FilterBar";
import MemberCard from "@/components/Members/MemberCard/MemberCard";
import PlaceholderNote from "@/components/UI/PlaceholderNote/PlaceholderNote";
import styles from "./page.module.css";

export default function MembersPage() {
  // Placeholder data - will be replaced with API data
  const placeholderMembers = [
    { id: 1, name: "Senator John Doe", party: "D", state: "CA" },
    { id: 2, name: "Rep. Jane Smith", party: "R", state: "TX" },
    { id: 3, name: "Senator Bob Johnson", party: "D", state: "NY" },
    { id: 4, name: "Rep. Sarah Williams", party: "R", state: "FL" },
    { id: 5, name: "Senator Mike Davis", party: "I", state: "VT" },
    { id: 6, name: "Rep. Emily Brown", party: "D", state: "CA" },
  ];

  const filters = [
    {
      name: "state",
      options: [
        { label: "All States", value: "all" },
        { label: "California", value: "ca" },
        { label: "Texas", value: "tx" },
        { label: "New York", value: "ny" },
        { label: "Florida", value: "fl" },
      ],
    },
    {
      name: "party",
      options: [
        { label: "All Parties", value: "all" },
        { label: "Democrat", value: "d" },
        { label: "Republican", value: "r" },
        { label: "Independent", value: "i" },
      ],
    },
    {
      name: "chamber",
      options: [
        { label: "All Chambers", value: "all" },
        { label: "Senate", value: "senate" },
        { label: "House", value: "house" },
      ],
    },
  ];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <PageHeader
            title="Congressional Members"
            description="Browse profiles of current congressional members including their biographies, committee assignments, voting records, and contact information."
          />

          <div className={styles.searchFilterSection}>
            <SearchBar placeholder="Search by name..." />
            <FilterBar filters={filters} />
          </div>

          <div className={styles.memberGrid}>
            {placeholderMembers.map((member) => (
              <MemberCard
                key={member.id}
                name={member.name}
                party={member.party}
                state={member.state}
                committees={3}
                bills={12}
              />
            ))}
          </div>

          <PlaceholderNote>
            <p>
              📊 Data will be sourced from ProPublica Congress API and VoteSmart
              API
            </p>
          </PlaceholderNote>
        </div>
      </main>
    </>
  );
}

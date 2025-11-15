"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import PageHeader from "@/components/UI/PageHeader/PageHeader";
import SearchBar from "@/components/UI/SearchBar/SearchBar";
import FilterBar from "@/components/UI/FilterBar/FilterBar";
import MemberCard from "@/components/Members/MemberCard/MemberCard";
import PlaceholderNote from "@/components/UI/PlaceholderNote/PlaceholderNote";
import { FaTimes } from "react-icons/fa";
import styles from "./page.module.css";
import { STATE_CODES, STATE_NAMES } from "@/utils/stateData";

type MemberItem = {
  id: string;
  name: string;
  party?: string | null;
  state?: string | null;
  stateCode?: string | null;
  district?: string | null;
  portraitUrl?: string | null;
  chamber?: "senate" | "house";
};

type MemberWithStats = MemberItem & {
  billsSponsoredCount?: number;
  billsCosponsoredCount?: number;
  yearsInService?: number;
};

export default function MembersPage() {
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // fetch page (moved below currentPage/pageSize declarations)

  const stateOptions = [
    { label: "All States", value: "all" },
    ...STATE_CODES.map((code) => ({
      label: STATE_NAMES[code as keyof typeof STATE_NAMES],
      value: code,
    })),
  ];

  const filters = [
    {
      name: "state",
      options: stateOptions,
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

  const [searchTerm, setSearchTerm] = useState<string>("");
  // searchInput is the immediate value coming from the input; we debounce
  // it to update `searchTerm` used for filtering.
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<{
    state: string;
    party: string;
    chamber: string;
  }>({ state: "all", party: "all", chamber: "all" });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadPage() {
      setLoading(true);
      try {
        const off = (currentPage - 1) * pageSize;
        const params = new URLSearchParams();
        params.set("type", "detailed");
        params.set("flat", "1");
        params.set("limit", String(pageSize));
        params.set("offset", String(off));
        if (searchTerm) params.set("q", searchTerm);
        if (selectedFilters.state && selectedFilters.state !== "all")
          params.set("state", selectedFilters.state);
        if (selectedFilters.party && selectedFilters.party !== "all")
          params.set("party", selectedFilters.party);
        if (selectedFilters.chamber && selectedFilters.chamber !== "all")
          params.set("chamber", selectedFilters.chamber);

        const url = `/api/congress?${params.toString()}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch members");
        const data = await res.json();

        if (!mounted) return;
        const newMembers = Array.isArray(data.items) ? data.items : [];
        setTotalMembers(typeof data.total === "number" ? data.total : 0);

        // Fetch stats for all members in this batch
        const membersWithStats = await Promise.all(
          newMembers.map(async (member: MemberItem) => {
            try {
              const statsRes = await fetch(
                `/api/member/stats?id=${encodeURIComponent(member.id)}`
              );
              if (!statsRes.ok) throw new Error("stats fetch failed");
              const statsData = await statsRes.json();
              return {
                ...member,
                billsSponsoredCount: statsData.billsSponsoredCount ?? 0,
                billsCosponsoredCount: statsData.billsCosponsoredCount ?? 0,
                yearsInService: statsData.yearsInService ?? 0,
              };
            } catch (e) {
              console.error(`Failed to fetch stats for ${member.id}:`, e);
              return {
                ...member,
                billsSponsoredCount: 0,
                billsCosponsoredCount: 0,
                yearsInService: 0,
              };
            }
          })
        );

        if (mounted) {
          setMembers(membersWithStats);
        }
      } catch (err: any) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPage();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [
    currentPage,
    searchTerm,
    selectedFilters.state,
    selectedFilters.party,
    selectedFilters.chamber,
  ]);

  const handleFilterChange = (name: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (value: string) => {
    // immediate submit (enter) will set searchTerm immediately
    setSearchTerm((value || "").trim());
    setSearchInput((value || "").trim());
  };

  // update input value immediately (for live typing)
  const handleInputChange = (value: string) => {
    setSearchInput(value || "");
  };

  // debounce searchInput -> searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    // reset to first page when filters/search change
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedFilters.state,
    selectedFilters.party,
    selectedFilters.chamber,
  ]);

  const normalizeParty = (p?: string | null) => {
    if (!p) return "";
    const low = p.toLowerCase();
    if (low.includes("dem")) return "d";
    if (low.includes("rep")) return "r";
    if (low.includes("ind")) return "i";
    return low.charAt(0);
  };

  // Using server-side pagination; members contains only the current page
  const total = totalMembers;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(total, pageStart + members.length);
  const pageItems = members;

  // Get active filters for badges
  const activeFilters: Array<{ key: string; label: string; value: string }> =
    [];
  if (searchTerm) {
    activeFilters.push({ key: "search", label: "Search", value: searchTerm });
  }
  if (selectedFilters.state && selectedFilters.state !== "all") {
    const stateLabel =
      STATE_NAMES[selectedFilters.state as keyof typeof STATE_NAMES] ||
      selectedFilters.state;
    activeFilters.push({
      key: "state",
      label: "State",
      value: stateLabel,
    });
  }
  if (selectedFilters.party && selectedFilters.party !== "all") {
    const partyLabel =
      selectedFilters.party === "d"
        ? "Democrat"
        : selectedFilters.party === "r"
        ? "Republican"
        : "Independent";
    activeFilters.push({
      key: "party",
      label: "Party",
      value: partyLabel,
    });
  }
  if (selectedFilters.chamber && selectedFilters.chamber !== "all") {
    activeFilters.push({
      key: "chamber",
      label: "Chamber",
      value:
        selectedFilters.chamber.charAt(0).toUpperCase() +
        selectedFilters.chamber.slice(1),
    });
  }

  const clearFilter = (key: string) => {
    if (key === "search") {
      setSearchTerm("");
      setSearchInput("");
    } else {
      setSelectedFilters((prev) => ({ ...prev, [key]: "all" }));
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <PageHeader
            title="The Members of Congress"
            description="Explore the complete directory of current U.S. Senators and Representatives. View their legislative records, sponsored bills, and years of service to better understand who represents you in Washington."
          />

          <div className={styles.searchFilterSection}>
            <SearchBar
              placeholder="Search by name..."
              onSearch={handleSearch}
              onChange={handleInputChange}
              showButton
            />
            <FilterBar filters={filters} onChange={handleFilterChange} />
            {activeFilters.length > 0 && (
              <div className={styles.activeBadges}>
                {activeFilters.map((filter) => (
                  <div key={filter.key} className={styles.badge}>
                    <span>
                      {filter.label}: {filter.value}
                    </span>
                    <button
                      className={styles.badgeRemove}
                      onClick={() => clearFilter(filter.key)}
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.memberGrid}>
            {loading ? (
              <>
                {Array.from({ length: pageSize }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonHeader} />
                    <div className={styles.skeletonBody}>
                      <div className={styles.skeletonLine} />
                      <div className={styles.skeletonLine} />
                      <div className={styles.skeletonLine} />
                    </div>
                  </div>
                ))}
              </>
            ) : total ? (
              pageItems.map((member) => (
                <MemberCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  party={member.party}
                  state={member.state}
                  district={member.district}
                  portraitUrl={member.portraitUrl}
                  bills={member.billsSponsoredCount}
                  billsCosponsored={member.billsCosponsoredCount}
                  yearsInService={member.yearsInService}
                  onViewProfile={() =>
                    (window.location.href = `/member/${member.id}`)
                  }
                />
              ))
            ) : (
              <PlaceholderNote>No members found</PlaceholderNote>
            )}
          </div>

          {total > pageSize && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {pageStart + 1}–{pageEnd} of {total}
              </div>
              <div className={styles.paginationControls}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
                <span className={styles.pageIndicator}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

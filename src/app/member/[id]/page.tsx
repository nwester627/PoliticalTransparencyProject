"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Card from "@/components/UI/Card/Card";
import Button from "@/components/UI/Button/Button";
import Image from "next/image";
import {
  FaRepublican,
  FaDemocrat,
  FaPhone,
  FaGlobe,
  FaArrowLeft,
  FaFileAlt,
  FaBirthdayCake,
  FaMapMarkerAlt,
} from "react-icons/fa";
import styles from "./page.module.css";

type MemberDetail = {
  bioguideId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthYear?: string;
  party?: string;
  state?: string;
  district?: number;
  chamber?: string;
  imageUrl?: string;
  phoneNumber?: string;
  officeAddress?: string;
  officialWebsiteUrl?: string;
  terms?: Array<{
    chamber: string;
    congress: number;
    startYear: number;
    endYear?: number;
    state: string;
    district?: number;
    memberType: string;
  }>;
  partyHistory?: Array<{
    partyName: string;
    partyAbbreviation: string;
    startYear: number;
    endYear?: number;
  }>;
  billsSponsoredCount?: number;
  billsCosponsoredCount?: number;
  yearsInService?: number;

  finances?: {
    candidate_id: string;
    committee_id?: string;
    cash_on_hand: number;
    total_receipts: number;
    total_disbursements: number;
    total_contributions: number;
    net_contributions: number;
    pac_contributions?: number;
    individual_contributions?: number;
  } | null;
  contributors?: Array<{
    contributor_name: string;
    contribution_receipt_amount: number;
    contributor_employer?: string;
    contributor_occupation?: string;
  }>;
  isPacFree?: boolean;
  isGrassroots?: boolean;
};

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the most up-to-date FEC cycle (even year). If current year
  // is odd (e.g. 2025) use the next even year (2026) which is often provided
  // by the FEC as the active two-year transaction period.
  const nowYear = new Date().getFullYear();
  const fecCycle = nowYear % 2 === 0 ? nowYear : nowYear + 1;

  // Threshold (percent) for labeling a candidate 'Grassroots Funded'
  // This should match the heuristic used when computing `isGrassroots`.
  const GRASSROOTS_THRESHOLD_PCT = 90;

  useEffect(() => {
    if (!id) return;

    async function loadMemberData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch member detail, stats, and votes in parallel
        const [detailRes, statsRes] = await Promise.all([
          fetch(
            `https://api.congress.gov/v3/member/${id}?api_key=${
              process.env.NEXT_PUBLIC_CONGRESS_API_KEY || ""
            }`
          ),
          fetch(`/api/member/stats?id=${id}`),
        ]);

        if (!detailRes.ok) throw new Error("Failed to fetch member details");

        const detailData = await detailRes.json();
        const statsData = statsRes.ok ? await statsRes.json() : {};
        const memberData = detailData.member;

        // Get FEC candidate ID and financial data for this member
        let financesData: any = null;
        try {
          const memberName =
            memberData.directOrderName || memberData.invertedOrderName || "";
          console.log("Searching FEC for:", memberName);
          // Search for candidate by name
          const searchRes = await fetch(
            `https://api.open.fec.gov/v1/candidates/search/?q=${encodeURIComponent(
              memberName
            )}&api_key=${process.env.NEXT_PUBLIC_FEC_API_KEY || ""}&per_page=1`
          );
          console.log("FEC search response:", searchRes.status);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            console.log("FEC search results:", searchData.results);
            const candidate = searchData.results?.[0];
            if (candidate?.candidate_id) {
              console.log("Found candidate ID:", candidate.candidate_id);
              // Get financial totals for this candidate
              const totalsRes = await fetch(
                `https://api.open.fec.gov/v1/candidate/${
                  candidate.candidate_id
                }/totals/?api_key=${
                  process.env.NEXT_PUBLIC_FEC_API_KEY || ""
                }&election_full=true`
              );
              console.log("FEC totals response:", totalsRes.status);
              if (totalsRes.ok) {
                const totalsData = await totalsRes.json();
                console.log("FEC totals data:", totalsData.results);
                // Find the most recent past election year with substantial financial data
                const results = totalsData.results || [];
                const currentYear = fecCycle;
                const pastResults = results
                  .filter((r: any) => r.candidate_election_year <= currentYear)
                  .sort(
                    (a: any, b: any) =>
                      b.candidate_election_year - a.candidate_election_year
                  );
                const latestTotals =
                  pastResults.find((r: any) => r.receipts > 10000) ||
                  pastResults[0] ||
                  results.find((r: any) => r.receipts > 10000) ||
                  results[0];
                console.log(
                  "Property names:",
                  latestTotals ? Object.keys(latestTotals) : []
                );
                if (latestTotals) {
                  const pacContributions =
                    latestTotals.other_political_committee_contributions || 0;
                  const individualContributions =
                    latestTotals.individual_contributions || 0;
                  const totalReceipts = latestTotals.receipts || 0;

                  financesData = {
                    candidate_id: candidate.candidate_id,
                    committee_id: undefined,
                    cash_on_hand: latestTotals.last_cash_on_hand_end_period,
                    total_receipts: totalReceipts,
                    total_disbursements: latestTotals.disbursements,
                    total_contributions: individualContributions,
                    net_contributions: latestTotals.net_contributions,
                    pac_contributions: pacContributions,
                    individual_contributions: individualContributions,
                  };
                  console.log("Finance data being saved:", financesData);
                }
              }
            }
          }
        } catch (finErr) {
          console.log("Finance data fetch failed:", finErr);
        }

        // Get committee ID and top contributors
        let contributorsData: any[] = [];
        let committeeId = null;
        let isGrassroots = false;

        if (financesData?.candidate_id) {
          try {
            // Get committee ID for this candidate
            const committeesRes = await fetch(
              `https://api.open.fec.gov/v1/candidate/${
                financesData.candidate_id
              }/committees/?api_key=${
                process.env.NEXT_PUBLIC_FEC_API_KEY || ""
              }`
            );
            if (committeesRes.ok) {
              const committeesData = await committeesRes.json();
              const principalCommittee = committeesData.results?.find(
                (c: any) => c.designation === "P"
              );
              committeeId = principalCommittee?.committee_id;

              if (committeeId) {
                financesData.committee_id = committeeId;

                // Get top contributors (individuals only) for the current FEC cycle
                const contributorsRes = await fetch(
                  `https://api.open.fec.gov/v1/schedules/schedule_a/?committee_id=${committeeId}&sort=-contribution_receipt_amount&per_page=10&two_year_transaction_period=${fecCycle}&contributor_type=individual&api_key=${
                    process.env.NEXT_PUBLIC_FEC_API_KEY || ""
                  }`
                );
                if (contributorsRes.ok) {
                  const contributorsJson = await contributorsRes.json();
                  contributorsData =
                    contributorsJson.results?.map((c: any) => ({
                      contributor_name: c.contributor_name,
                      contribution_receipt_amount:
                        c.contribution_receipt_amount,
                      contributor_employer: c.contributor_employer,
                      contributor_occupation: c.contributor_occupation,
                    })) || [];
                  console.log("Top contributors:", contributorsData);
                }

                // Determine badges
                const pacContributions = financesData.pac_contributions || 0;
                const individualContributions =
                  financesData.individual_contributions || 0;
                const totalReceipts = financesData.total_receipts || 0;

                const individualPercentage =
                  totalReceipts > 0
                    ? (individualContributions / totalReceipts) * 100
                    : 0;

                console.log("Badge calculation:", {
                  pacContributions,
                  individualContributions,
                  totalReceipts,
                  individualPercentage: individualPercentage.toFixed(2) + "%",
                });

                // Grassroots = 90%+ from individuals
                isGrassroots =
                  individualContributions > totalReceipts * 0.9 &&
                  totalReceipts > 0;
              }
            }
          } catch (contribErr) {
            console.log("Contributors fetch failed:", contribErr);
          }
        }

        const memberState = {
          bioguideId: memberData.bioguideId,
          name:
            memberData.directOrderName || memberData.invertedOrderName || "",
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          middleName: memberData.middleName,
          birthYear: memberData.birthYear,
          imageUrl: memberData.depiction?.imageUrl,
          officialWebsiteUrl: memberData.officialWebsiteUrl,
          phoneNumber: memberData.addressInformation?.phoneNumber,
          officeAddress: memberData.addressInformation?.officeAddress,
          terms: memberData.terms || [],
          partyHistory: memberData.partyHistory || [],
          billsSponsoredCount: statsData.billsSponsoredCount,
          billsCosponsoredCount: statsData.billsCosponsoredCount,
          billsSponsoredSampleSize: statsData.billsSponsoredSampleSize,
          billsSponsoredPassedCount: statsData.billsSponsoredPassedCount,
          billsSponsoredPassRate: statsData.billsSponsoredPassRate,
          billsCosponsoredSampleSize: statsData.billsCosponsoredSampleSize,
          billsCosponsoredPassedCount: statsData.billsCosponsoredPassedCount,
          billsCosponsoredPassRate: statsData.billsCosponsoredPassRate,
          yearsInService: statsData.yearsInService,
          finances: financesData,
          contributors: contributorsData,
          isGrassroots: isGrassroots,
          // Derive current info from most recent term
          party: memberData.partyHistory?.[0]?.partyName,
          state: memberData.state,
          district: memberData.district,
          chamber: memberData.terms?.[memberData.terms.length - 1]?.chamber,
        };
        console.log(
          "Setting member state with finances:",
          memberState.finances
        );
        setMember(memberState);
      } catch (err) {
        console.error("Error loading member:", err);
        setError("Failed to load member profile");
      } finally {
        setLoading(false);
      }
    }

    loadMemberData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loading}>Loading member profile...</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !member) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <Button onClick={() => router.push("/members")}>
              <FaArrowLeft /> Back to Members
            </Button>
            <div className={styles.error}>{error || "Member not found"}</div>
          </div>
        </main>
      </>
    );
  }

  const partyKey = member.party?.toLowerCase().includes("democrat")
    ? "democrat"
    : member.party?.toLowerCase().includes("republican")
    ? "republican"
    : "independent";

  console.log("Rendering badges:", {
    isGrassroots: member.isGrassroots,
  });
  const recentSample = [
    {
      title: "Improving Infrastructure Act (placeholder)",
      status: "Introduced",
      date: "2025-10-12",
      url: "#",
    },
    {
      title: "Healthcare Affordability Amendment (placeholder)",
      status: "Pending",
      date: "2025-07-21",
      url: "#",
    },
    {
      title: "Education Support Bill (placeholder)",
      status: "Passed",
      date: "2025-03-18",
      url: "#",
    },
  ];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <Button
            onClick={() => router.push("/members")}
            className={styles.backButton}
          >
            <FaArrowLeft /> Back to Members
          </Button>

          <div className={`${styles.profileHeader} ${styles[partyKey]}`}>
            <div className={styles.profileImage}>
              {member.imageUrl ? (
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  width={200}
                  height={200}
                  className={styles.image}
                />
              ) : (
                <span className={styles.imagePlaceholder}>👤</span>
              )}
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.leftSection}>
                <h1 className={styles.memberName}>{member.name}</h1>
                <p className={styles.memberTitle}>
                  {member.chamber === "House of Representatives"
                    ? "Representative"
                    : "Senator"}{" "}
                  • {member.state}
                  {member.district ? ` District ${member.district}` : ""}
                </p>

                <div className={styles.badgesContainer}>
                  <div className={`${styles.partyBadge} ${styles[partyKey]}`}>
                    <span className={styles.badgeIcon}>
                      {partyKey === "republican" && <FaRepublican size={16} />}
                      {partyKey === "democrat" && <FaDemocrat size={16} />}
                      {partyKey === "independent" && <span>I</span>}
                    </span>
                    {member.party}
                  </div>

                  {member.isGrassroots === true && (
                    <div
                      className={`${styles.fundingBadge} ${styles.grassroots}`}
                    >
                      🌱 Grassroots Funded
                    </div>
                  )}
                  {member.isGrassroots === true && (
                    <div className={styles.grassrootsDisclaimer}>
                      "Grassroots Funded" indicates this candidate received more
                      than {GRASSROOTS_THRESHOLD_PCT}% of reported receipts from
                      individual contributors for the {fecCycle} cycle.
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.rightSection}>
                <div className={styles.bioDetails}>
                  {member.birthYear && (
                    <div className={styles.bioItem}>
                      <FaBirthdayCake size={14} />
                      <span>
                        {member.birthYear}{" "}
                        {member.birthYear &&
                          `(${2025 - parseInt(member.birthYear)} years old)`}
                      </span>
                    </div>
                  )}
                  {member.officeAddress && (
                    <div className={styles.bioItem}>
                      <FaMapMarkerAlt size={14} />
                      <span>{member.officeAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.profileGrid}>
            {/* Top panels container: stacked vertically */}
            <div className={styles.topPanels}>
              <Card className={`${styles.statsCard} ${styles.wideCard}`}>
                <h2 className={styles.sectionTitle}>Legislative Activity</h2>
                <div className={styles.statsGrid}>
                  <div className={`${styles.statBox} ${styles.statClickable}`}>
                    <div className={styles.statValue}>
                      {member.billsSponsoredCount || 0}
                    </div>
                    <div className={styles.statLabel}>
                      <span className={styles.statIcon} aria-hidden>
                        <FaFileAlt />
                      </span>
                      Bills Sponsored
                    </div>
                    <div className={styles.statHint}>
                      View all sponsored bills (coming soon)
                    </div>
                  </div>
                  <div className={`${styles.statBox} ${styles.statClickable}`}>
                    <div className={styles.statValue}>
                      {member.billsCosponsoredCount || 0}
                    </div>
                    <div className={styles.statLabel}>
                      <span className={styles.statIcon} aria-hidden>
                        <FaFileAlt />
                      </span>
                      Bills Cosponsored
                    </div>
                    <div className={styles.statHint}>
                      View all cosponsored bills (coming soon)
                    </div>
                  </div>
                  <div className={styles.statBox}>
                    <div className={styles.statValue}>
                      {member.yearsInService || 0}
                    </div>
                    <div className={styles.statLabel}>Years in Service</div>
                  </div>
                </div>

                <div className={styles.recentSection}>
                  <h3 className={styles.recentHeading}>Recent Activity</h3>
                  <div className={styles.recentList}>
                    {recentSample.map((b, i) => (
                      <div key={i} className={styles.recentItem}>
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.recentTitle}
                        >
                          <span className={styles.recentIcon} aria-hidden>
                            <FaFileAlt />
                          </span>
                          <span className={styles.recentTitleText}>
                            {b.title}
                          </span>
                        </a>
                        <div className={styles.recentMeta}>
                          <span
                            className={`${styles.statusBadge} ${
                              b.status === "Passed"
                                ? styles.statusPassed
                                : b.status === "Pending"
                                ? styles.statusPending
                                : styles.statusIntroduced
                            }`}
                          >
                            {b.status}
                          </span>
                          <span className={styles.recentDate}>{b.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.showMoreWrap}>
                    <a
                      href={`/members/${id}/bills`}
                      className={styles.showMoreLink}
                    >
                      Show more
                    </a>
                  </div>
                </div>
              </Card>

              {member.terms && member.terms.length > 0 && (
                <Card className={styles.termsCard}>
                  <h2 className={styles.sectionTitle}>Congressional Terms</h2>
                  <div className={styles.termsList}>
                    {member.terms
                      .slice()
                      .sort((a, b) => b.startYear - a.startYear)
                      .map((term, idx) => (
                        <div
                          key={idx}
                          className={`${styles.termItem} ${
                            !term.endYear ? styles.currentTerm : ""
                          }`}
                        >
                          <div className={styles.termHead}>
                            <div className={styles.termValue}>
                              {term.congress}
                              {term.congress === 1
                                ? "st"
                                : term.congress === 2
                                ? "nd"
                                : term.congress === 3
                                ? "rd"
                                : "th"}{" "}
                              Congress
                            </div>

                            <div className={styles.termPills}>
                              <span
                                className={styles.termPill}
                                title={term.chamber}
                              >
                                {term.chamber?.toLowerCase().includes("house")
                                  ? "House of Reps"
                                  : term.chamber
                                      ?.toLowerCase()
                                      .includes("senate")
                                  ? "Senate"
                                  : term.chamber}
                              </span>

                              {term.district ? (
                                <span className={styles.termPillSecondary}>
                                  District {term.district}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className={styles.termLabel}>
                            <div className={styles.termState}>{term.state}</div>
                            <div className={styles.termYears}>
                              {term.startYear}
                              {term.endYear
                                ? ` - ${term.endYear}`
                                : " - Present"}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}

              <Card className={styles.financesCard}>
                <h2 className={styles.sectionTitle}>Campaign Finance</h2>
                <div className={styles.financesContent}>
                  {member.finances ? (
                    <>
                      <div className={styles.financesGrid}>
                        <div className={styles.financeItem}>
                          <div className={styles.financeValue}>
                            $
                            {(
                              member.finances.cash_on_hand || 0
                            ).toLocaleString()}
                          </div>
                          <div className={styles.financeLabel}>
                            Cash on Hand
                          </div>
                        </div>
                        <div className={styles.financeItem}>
                          <div className={styles.financeValue}>
                            $
                            {(
                              member.finances.total_receipts || 0
                            ).toLocaleString()}
                          </div>
                          <div className={styles.financeLabel}>
                            Total Receipts
                          </div>
                        </div>
                        <div className={styles.financeItem}>
                          <div className={styles.financeValue}>
                            $
                            {(
                              member.finances.total_disbursements || 0
                            ).toLocaleString()}
                          </div>
                          <div className={styles.financeLabel}>
                            Total Disbursements
                          </div>
                        </div>
                      </div>

                      {/* Funding breakdown */}
                      <div className={styles.fundingBreakdown}>
                        {(() => {
                          const pac = member.finances.pac_contributions || 0;
                          const indiv =
                            member.finances.individual_contributions || 0;
                          const explicitTotal =
                            member.finances.total_receipts || 0;
                          const inferredTotal = pac + indiv || explicitTotal;
                          const total = explicitTotal || inferredTotal || 1;
                          const pacPct = Math.round((pac / total) * 100);
                          const indivPct = Math.round((indiv / total) * 100);
                          return (
                            <>
                              <div className={styles.fundingHeader}>
                                <div className={styles.fundingHeaderTitle}>
                                  Funding Breakdown
                                </div>
                                <div className={styles.fundingHeaderMeta}>
                                  <span className={styles.fundingAmount}>
                                    ${total.toLocaleString()} total
                                  </span>
                                </div>
                              </div>

                              <div className={styles.breakdownBar} aria-hidden>
                                <div
                                  className={`${styles.breakdownSegment} ${styles.breakdownIndiv}`}
                                  style={{ width: `${indivPct}%` }}
                                />
                                <div
                                  className={`${styles.breakdownSegment} ${styles.breakdownPac}`}
                                  style={{ width: `${pacPct}%` }}
                                />
                              </div>

                              <div className={styles.fundingLegend}>
                                <div className={styles.legendItem}>
                                  <span
                                    className={`${styles.legendDot} ${styles.legendIndiv}`}
                                  />
                                  <span className={styles.legendLabel}>
                                    Individuals • {indivPct}%
                                  </span>
                                  <span className={styles.legendValue}>
                                    ${indiv.toLocaleString()}
                                  </span>
                                </div>
                                <div className={styles.legendItem}>
                                  <span
                                    className={`${styles.legendDot} ${styles.legendPac}`}
                                  />
                                  <span className={styles.legendLabel}>
                                    PACs • {pacPct}%
                                  </span>
                                  <span className={styles.legendValue}>
                                    ${pac.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* View on FEC button removed; disclaimer will be shown below contributors */}

                      {member.contributors &&
                        member.contributors.length > 0 && (
                          <div className={styles.contributorsSection}>
                            <h3 className={styles.contributorsTitle}>
                              Top Contributors ({fecCycle} Cycle)
                            </h3>
                            <div className={styles.contributorsList}>
                              {member.contributors.map((contributor, idx) => {
                                const amt =
                                  contributor.contribution_receipt_amount || 0;
                                const totalReceipts =
                                  member.finances?.total_receipts || 1;
                                const pct =
                                  Math.round((amt / totalReceipts) * 10000) /
                                  100; // 2 decimals
                                const employer =
                                  contributor.contributor_employer;
                                const occupation =
                                  contributor.contributor_occupation;

                                return (
                                  <div
                                    key={idx}
                                    className={styles.contributorItem}
                                  >
                                    <div className={styles.contributorInfo}>
                                      <div
                                        className={styles.contributorName}
                                        title={contributor.contributor_name}
                                      >
                                        {contributor.contributor_name}
                                      </div>

                                      {(employer || occupation) && (
                                        <div
                                          className={styles.contributorMeta}
                                          title={`${occupation || ""}${
                                            occupation && employer ? " • " : ""
                                          }${employer || ""}`}
                                        >
                                          {occupation}
                                          {occupation && employer && " • "}
                                          {employer}
                                        </div>
                                      )}

                                      <div
                                        className={styles.contribBar}
                                        aria-hidden
                                      >
                                        <div
                                          className={styles.contribBarFill}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>

                                    <div className={styles.contributorAmount}>
                                      ${amt.toLocaleString()}
                                      <span
                                        className={styles.contributorPercent}
                                      >
                                        &nbsp;• {pct}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      <div className={styles.fecDisclaimer}>
                        <small>
                          Information sourced from the FEC. You can view this
                          {member.finances?.candidate_id ? (
                            <>
                              &nbsp;
                              <a
                                href={`https://www.fec.gov/data/candidate/${member.finances.candidate_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                candidate's FEC disclosure
                              </a>
                              .
                            </>
                          ) : (
                            <>
                              &nbsp;
                              <a
                                href="https://www.fec.gov"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                FEC disclosures
                              </a>
                              .
                            </>
                          )}
                        </small>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={styles.financesNote}>
                        Campaign finance data is currently loading or
                        unavailable.
                      </p>
                      <p className={styles.financesNote}>
                        Data provided by{" "}
                        <a
                          href="https://www.fec.gov/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.apiLink}
                        >
                          Federal Election Commission
                        </a>
                      </p>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* Other cards below the topPanels container */}
            {member.partyHistory && member.partyHistory.length > 1 && (
              <Card className={styles.historyCard}>
                <h2 className={styles.sectionTitle}>
                  Party Affiliation History
                </h2>
                <div className={styles.historyList}>
                  {member.partyHistory.map((history, idx) => (
                    <div key={idx} className={styles.historyItem}>
                      <div className={styles.historyParty}>
                        {history.partyName}
                      </div>
                      <div className={styles.historyYears}>
                        {history.startYear}
                        {history.endYear
                          ? ` - ${history.endYear}`
                          : " - Present"}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

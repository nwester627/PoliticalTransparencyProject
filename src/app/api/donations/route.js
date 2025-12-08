import { NextResponse } from "next/server";

// Server-side FEC API base and key. Prefer secure server API key (server-only) if present.
const FEC_BASE = "https://api.open.fec.gov/v1";
const API_KEY = process.env.FEC_API_KEY || null;

if (!API_KEY) {
  // Warn in server logs when no server key is configured. We still attempt public calls
  // but results may be limited or rate-limited. Do NOT add the key with NEXT_PUBLIC_ prefix.
  console.warn(
    "FEC_API_KEY is not set. Schedule A and detailed aggregation will use unauthenticated requests which may be rate-limited. Set a server-only FEC_API_KEY in your environment."
  );
}

// In-memory caches to limit FEC API usage. These are simple and reset when the server restarts.
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const candidateIndustryCache = new Map(); // candidateId -> { ts, data }
const partyAggregatesCache = new Map(); // partyKey -> { ts, data }

function isCacheFresh(entry) {
  return entry && Date.now() - entry.ts < CACHE_TTL_MS;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch and aggregate Schedule A (contributions) for a candidate, with basic caching.
async function fetchCandidateIndustriesFromFEC(candidateId) {
  const cached = candidateIndustryCache.get(candidateId);
  if (isCacheFresh(cached)) return cached.data;

  const perPage = 100;
  let page = 1;
  let more = true;
  const agg = new Map();
  let total = 0;

  try {
    while (more && page <= 10) {
      const url = `${FEC_BASE}/schedules/schedule_a/?candidate_id=${encodeURIComponent(
        candidateId
      )}&per_page=${perPage}&page=${page}&${
        API_KEY ? `api_key=${encodeURIComponent(API_KEY)}&` : ""
      }`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        console.warn(
          `FEC schedule_a fetch failed for ${candidateId}: ${res.status}`
        );
        break;
      }
      const json = await res.json();
      const results = json.results || [];
      for (const r of results) {
        const contributor =
          r.contributor_name ||
          r.contributor_organization ||
          r.contributor_employer ||
          "Unknown";
        const amount =
          Number(r.contribution_receipt_amount || r.amount || 0) || 0;
        const key = contributor.trim();
        const entry = agg.get(key) || {
          name: key,
          amount: 0,
          committee_id: r.committee_id || null,
        };
        entry.amount += amount;
        agg.set(key, entry);
        total += amount;
      }

      const pagination = json.pagination || {};
      more = pagination.pages && page < pagination.pages;
      page += 1;
      await sleep(250); // stagger requests to be kind to FEC rate limits
    }
  } catch (err) {
    console.error(`Error fetching schedule_a for ${candidateId}:`, err);
  }

  const list = Array.from(agg.values()).sort((a, b) => b.amount - a.amount);
  const result = { total, topContributors: list.slice(0, 50) };
  candidateIndustryCache.set(candidateId, { ts: Date.now(), data: result });
  return result;
}

async function fetchCandidateTotalsFromFEC(candidateId) {
  try {
    const url = `${FEC_BASE}/candidate/${encodeURIComponent(
      candidateId
    )}/totals/?${
      API_KEY ? `api_key=${encodeURIComponent(API_KEY)}&` : ""
    }election_full=true`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.warn(`FEC totals fetch failed for ${candidateId}: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json.results?.[0] || null;
  } catch (err) {
    console.error("Error calling FEC totals:", err);
    return null;
  }
}

async function fetchCandidateDetailFromFEC(candidateId) {
  try {
    const url = `${FEC_BASE}/candidate/${encodeURIComponent(candidateId)}/?${
      API_KEY ? `api_key=${encodeURIComponent(API_KEY)}&` : ""
    }`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.warn(
        `FEC candidate fetch failed for ${candidateId}: ${res.status}`
      );
      return null;
    }
    const json = await res.json();
    return json.results?.[0] || null;
  } catch (err) {
    console.error("Error calling FEC candidate:", err);
    return null;
  }
}

export async function GET(request) {
  try {
    // Candidate IDs to check (common top fundraisers)
    const candidateIds = [
      "P80001571", // Donald Trump
      "P80000722", // Joe Biden
      "P40013074", // Ron DeSantis
      "S2MA00170", // Elizabeth Warren
      "S4VT00033", // Bernie Sanders
      "S2KY00012", // Mitch McConnell
      "S8NY00082", // Chuck Schumer
      "H6CA22125", // Kevin McCarthy
      "H8CA05035", // Nancy Pelosi
      "S2TX00312", // Ted Cruz
    ];

    // Fetch totals and details in parallel
    const totalsPromises = candidateIds.map((id) =>
      fetchCandidateTotalsFromFEC(id)
    );
    const detailsPromises = candidateIds.map((id) =>
      fetchCandidateDetailFromFEC(id)
    );
    const totals = await Promise.all(totalsPromises);
    const details = await Promise.all(detailsPromises);

    // Build list of candidates with normalized fields
    const topCandidates = [];
    for (let i = 0; i < candidateIds.length; i++) {
      const t = totals[i];
      const d = details[i];
      if (!t && !d) continue;

      const name = d?.name || t?.name || candidateIds[i];
      // normalize cash: prefer last_cash_on_hand_end_period, then cash_on_hand_end_period, then last_report_cash_on_hand, then 0
      const cash =
        t?.last_cash_on_hand_end_period ??
        t?.cash_on_hand_end_period ??
        t?.last_report_cash_on_hand ??
        0;
      const receipts = t?.receipts ?? 0;
      const disbursements = t?.disbursements ?? 0;
      const party = d?.party || t?.party || "UNK";
      const state = d?.state || t?.state || "UNK";
      const office = d?.office || t?.office || "UNK";

      topCandidates.push({
        name,
        receipts,
        disbursements,
        cash_on_hand: cash,
        party,
        state,
        office,
        candidate_id: candidateIds[i],
      });
    }

    // Determine whether we obtained any real candidate data from the FEC
    const hadRealData = topCandidates.length > 0;

    // If we couldn't get any real data, provide conservative fallback example data
    if (!hadRealData) {
      topCandidates.push(
        {
          name: "DONALD J. TRUMP",
          receipts: 200000000,
          disbursements: 150000000,
          cash_on_hand: 50000000,
          party: "REP",
          state: "FL",
          office: "P",
          candidate_id: "P80001571",
        },
        {
          name: "JOSEPH R. BIDEN",
          receipts: 150000000,
          disbursements: 120000000,
          cash_on_hand: 30000000,
          party: "DEM",
          state: "DE",
          office: "P",
          candidate_id: "P80000722",
        }
      );
    }

    // Mock data for contributors and industries (aggregated endpoints may require more complex queries)
    const topContributors = [
      { name: "Various Individual Donors", amount: 50000000, count: 10000 },
      { name: "PAC Contributions", amount: 25000000, count: 500 },
      { name: "Self-Funded Candidates", amount: 20000000, count: 50 },
    ];

    const topIndustries = [
      { name: "Technology", amount: 15000000, count: 2000 },
      { name: "Healthcare", amount: 12000000, count: 1800 },
      { name: "Finance", amount: 10000000, count: 1500 },
      { name: "Energy", amount: 8000000, count: 1200 },
      { name: "Defense", amount: 7000000, count: 1000 },
      { name: "Other", amount: 8000000, count: 1100 },
    ];

    const totalRaised = topCandidates.reduce(
      (sum, c) => sum + (c.receipts || 0),
      0
    );
    const totalSpent = topCandidates.reduce(
      (sum, c) => sum + (c.disbursements || 0),
      0
    );

    const isMock = !hadRealData;

    // Parse query params for optional detailed party aggregation
    const url = new URL(request.url);
    const partyParam = url.searchParams.get("party");
    const detail = url.searchParams.get("detail") === "true";

    // If client requested detailed party-level aggregation, compute it lazily and cache result.
    let topIndustriesByParty = null;
    if (detail && partyParam) {
      const partyKey = partyParam.toUpperCase();
      const cached = partyAggregatesCache.get(partyKey);
      if (isCacheFresh(cached)) {
        topIndustriesByParty = { [partyKey]: cached.data.topCompanies };
      } else {
        // Build aggregates across candidates of that party
        const candidatesOfParty = topCandidates.filter((c) => {
          const p = String(c.party || "").toUpperCase();
          return p.includes(partyKey) || p === partyKey;
        });

        // If no candidates of that party are present, return empty but do not fail
        const aggregateMap = new Map();
        let partyTotal = 0;
        let pacTotal = 0;
        let individualTotal = 0;

        for (const cand of candidatesOfParty) {
          // Fetch per-candidate schedule_a aggregates (cached inside helper)
          const candAgg = await fetchCandidateIndustriesFromFEC(
            cand.candidate_id
          );
          if (!candAgg) continue;
          partyTotal += candAgg.total || 0;
          for (const entry of candAgg.topContributors || []) {
            const key = entry.name || "Unknown";
            const existing = aggregateMap.get(key) || { name: key, amount: 0 };
            existing.amount += entry.amount || 0;
            aggregateMap.set(key, existing);
            if (entry.committee_id) pacTotal += entry.amount || 0;
            else individualTotal += entry.amount || 0;
          }
          // Stagger between candidates to reduce burstiness
          await sleep(300);
        }

        const companies = Array.from(aggregateMap.values()).sort(
          (a, b) => b.amount - a.amount
        );
        const topCompanies = companies.slice(0, 50);
        const donorTypeShares = {
          pacTotal,
          individualTotal,
          partyTotal: partyTotal || companies.reduce((s, x) => s + x.amount, 0),
        };

        const payload = { topCompanies, donorTypeShares };
        partyAggregatesCache.set(partyKey, { ts: Date.now(), data: payload });
        topIndustriesByParty = { [partyKey]: topCompanies };
      }
    }

    return NextResponse.json({
      topContributors,
      topIndustries,
      topCandidates,
      topIndustriesByParty,
      totals: {
        totalRaised,
        totalSpent,
        uniqueDonors: topContributors.reduce((sum, c) => sum + c.count, 0),
        avgDonation:
          totalRaised /
          Math.max(
            1,
            topContributors.reduce((sum, c) => sum + c.count, 0)
          ),
      },
      meta: {
        source: isMock ? "mock" : "fec",
        candidateCount: topCandidates.length,
        hadPartyAggregates: topIndustriesByParty != null,
      },
    });
  } catch (error) {
    console.error("Error fetching donations data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

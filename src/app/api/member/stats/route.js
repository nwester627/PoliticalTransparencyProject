import { NextResponse } from "next/server";
import { getCurrentCongressNumber } from "@/utils/congressHelpers";

// Use Congress.gov API (v3) via existing API key
const API_KEY =
  process.env.NEXT_PUBLIC_CONGRESS_API_KEY ||
  process.env.CONGRESS_API_KEY ||
  null;
const BASE = "https://api.congress.gov/v3";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const inMemoryCache = new Map();

// NOTE: Congress.gov API v3 does not provide committee membership data
// Committee information is not available through their member detail or committee detail endpoints
// This would require an alternative data source (e.g., ProPublica API, GovTrack, or manual data)

async function fetchLegislationBySponsor(congress, id) {
  // Use member-specific sponsored legislation endpoint
  // Optionally a congress query param can be supplied, but omit it to get all congresses
  const url = `${BASE}/member/${id}/sponsored-legislation?api_key=${API_KEY}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Legislation sponsor ${res.status}`);
  return res.json();
}

async function fetchLegislationByCosponsor(congress, id) {
  // Use member-specific cosponsored legislation endpoint
  const url = `${BASE}/member/${id}/cosponsored-legislation?api_key=${API_KEY}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Legislation cosponsor ${res.status}`);
  return res.json();
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  if (!API_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing Congress.gov API key (NEXT_PUBLIC_CONGRESS_API_KEY or CONGRESS_API_KEY)",
      },
      { status: 501 }
    );
  }

  const cacheKey = `member-stats:${id}`;
  const now = Date.now();
  const cached = inMemoryCache.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const congress = getCurrentCongressNumber();

    const [memberDetail, sponsorJson, cosponsorJson] = await Promise.all([
      fetch(`${BASE}/member/${id}?api_key=${API_KEY}`, {
        headers: { Accept: "application/json" },
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetchLegislationBySponsor(congress, id).catch(() => null),
      fetchLegislationByCosponsor(congress, id).catch(() => null),
    ]);

    // Calculate years in service from terms
    let yearsInService = 0;
    try {
      const member = memberDetail?.member;
      const terms = member?.terms || [];
      if (Array.isArray(terms) && terms.length > 0) {
        // Get the earliest start year and calculate from there
        const startYears = terms
          .map((t) => t.startYear)
          .filter((y) => y)
          .sort((a, b) => a - b);
        if (startYears.length > 0) {
          const currentYear = new Date().getFullYear();
          yearsInService = currentYear - startYears[0];
        }
      }
    } catch (e) {
      yearsInService = 0;
    }

    // Committee data is not available from Congress.gov API v3
    const committees = [];

    const sponsoredCount =
      sponsorJson?.pagination?.count ??
      sponsorJson?.results?.[0]?.num_results ??
      0;
    const cosponsoredCount =
      cosponsorJson?.pagination?.count ??
      cosponsorJson?.results?.[0]?.num_results ??
      0;

    const data = {
      committees,
      billsSponsoredCount: Number(sponsoredCount || 0),
      billsCosponsoredCount: Number(cosponsoredCount || 0),
      yearsInService,
      fetchedAt: now,
    };

    inMemoryCache.set(cacheKey, { ts: now, data });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/member/stats (congress.gov):", error);
    return NextResponse.json({ error: "failed to fetch" }, { status: 500 });
  }
}

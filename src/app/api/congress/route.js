import { NextResponse } from "next/server";
import { STATE_CODES, STATE_NAMES, US_TERRITORIES } from "@/utils/stateData";
import {
  normalizePartyName,
  getCurrentCongressNumber,
} from "@/utils/congressHelpers";

const API_KEY = process.env.NEXT_PUBLIC_CONGRESS_API_KEY || "DEMO_KEY";
const BASE_URL = "https://api.congress.gov/v3";
const CACHE_TTL = 3600000; // 1 hour cache

let cachedData = {
  senate: null,
  house: null,
  timestamp: 0,
};

async function fetchHouseData() {
  let republicans = 0;
  let democrats = 0;
  let independents = 0;
  const currentCongress = getCurrentCongressNumber(); // 119 for 2025-2027
  const currentYear = new Date().getUTCFullYear(); // 2025

  try {
    // Use Congress-level endpoint WITHOUT currentMember filter
    // We'll manually check terms to ensure accuracy
    const limit = 250;
    let offset = 0;
    let totalCount = Infinity;

    while (offset < totalCount) {
      const url = `${BASE_URL}/member/congress/${currentCongress}?chamber=house&limit=${limit}&offset=${offset}&api_key=${API_KEY}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        console.error(`House API error: ${response.status}`);
        break;
      }

      const data = await response.json();
      const members = data.members || [];

      if (data.pagination?.count != null) {
        totalCount = data.pagination.count;
      } else if (members.length < limit) {
        totalCount = offset + members.length;
      }

      for (const member of members) {
        // Only count voting members from the 50 states (skip delegates/resident commissioner)
        const state = member.state || "";

        // API returns full state names, so need to exclude territories
        if (US_TERRITORIES.includes(state)) {
          continue;
        }

        // Check if member has a current House term by examining their terms
        if (!member.terms || !member.terms.item) {
          continue;
        }

        const terms = Array.isArray(member.terms.item)
          ? member.terms.item
          : [member.terms.item];

        // Get the latest House term
        const latestTerm = terms[terms.length - 1];
        const chamber = latestTerm?.chamber || "";
        const isHouse =
          chamber === "House of Representatives" ||
          chamber === "House" ||
          chamber.includes("House");

        if (!isHouse) {
          continue; // Skip if latest term is not House (e.g., moved to Senate)
        }

        // Check if this term is current using endYear
        const endYearNum = latestTerm?.endYear
          ? Number(latestTerm.endYear)
          : null;

        // A current House member should have:
        // - No endYear (still serving), OR
        // - endYear > currentYear (term extends beyond current year)
        // Members with endYear === 2025 ended their term on Jan 3, 2025 (not current)
        const isCurrentMember = endYearNum === null || endYearNum > currentYear;

        if (!isCurrentMember) {
          continue; // Skip members whose terms have ended
        }

        const party = normalizePartyName(member.partyName);
        if (party === "Republican") republicans++;
        else if (party === "Democrat") democrats++;
        else if (party === "Independent") independents++;
      }

      offset += members.length || limit;
      if (!members.length) break;
    }
  } catch (error) {
    console.error("Error fetching House composition:", error);
  }

  const filled = republicans + democrats + independents;
  const vacant = Math.max(435 - filled, 0);

  return { republicans, democrats, independents, vacant };
}

async function fetchSenateData() {
  const senateData = {};
  const currentYear = new Date().getUTCFullYear();

  // Fetch all states in parallel with limited concurrency
  const BATCH_SIZE = 10;
  for (let i = 0; i < STATE_CODES.length; i += BATCH_SIZE) {
    const batch = STATE_CODES.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (stateCode) => {
        try {
          const url = `${BASE_URL}/member/${stateCode}?currentMember=true&api_key=${API_KEY}`;
          const response = await fetch(url, {
            headers: { Accept: "application/json" },
            next: { revalidate: 3600 },
          });

          if (!response.ok) return;

          const data = await response.json();
          const members = data.members || [];

          const senators = members.filter((member) => {
            if (!member.terms || !member.terms.item) return false;
            const terms = Array.isArray(member.terms.item)
              ? member.terms.item
              : [member.terms.item];
            const latestTerm = terms[terms.length - 1];
            const endYearNum = latestTerm?.endYear
              ? Number(latestTerm.endYear)
              : null;
            return (
              latestTerm?.chamber === "Senate" &&
              (endYearNum === null || endYearNum >= currentYear)
            );
          });

          if (senators.length) {
            const senatorData = senators.map((senator) => ({
              name: senator.directOrderName || senator.name || "Unknown",
              party: normalizePartyName(senator.partyName),
              bioguideId: senator.bioguideId,
            }));

            const parties = senatorData.map((s) => s.party);
            let control = "Split";
            if (parties.length === 2 && parties[0] === parties[1]) {
              control =
                parties[0] === "Republican"
                  ? "Republican"
                  : parties[0] === "Democrat"
                  ? "Democrat"
                  : "Split";
            }

            senateData[stateCode] = {
              name: STATE_NAMES[stateCode],
              senators: senatorData,
              control,
            };
          }
        } catch (error) {
          console.error(`Error fetching ${stateCode}:`, error);
        }
      })
    );
  }

  return senateData;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'senate' or 'house' or 'all'

  const now = Date.now();
  const isCacheValid = now - cachedData.timestamp < CACHE_TTL;

  try {
    if (type === "house" || type === "all") {
      if (!isCacheValid || !cachedData.house) {
        cachedData.house = await fetchHouseData();
        cachedData.timestamp = now;
      }
      if (type === "house") {
        return NextResponse.json(cachedData.house);
      }
    }

    if (type === "senate" || type === "all") {
      if (!isCacheValid || !cachedData.senate) {
        cachedData.senate = await fetchSenateData();
        cachedData.timestamp = now;
      }
      if (type === "senate") {
        return NextResponse.json(cachedData.senate);
      }
    }

    // Return all data
    if (type === "all") {
      return NextResponse.json({
        senate: cachedData.senate,
        house: cachedData.house,
      });
    }

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching congress data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

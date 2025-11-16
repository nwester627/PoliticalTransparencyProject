import { NextResponse } from "next/server";
import { STATE_CODES, STATE_NAMES, US_TERRITORIES } from "@/utils/stateData";
import {
  normalizePartyName,
  getCurrentCongressNumber,
} from "@/utils/congressHelpers";

const API_KEY = process.env.CONGRESS_API_KEY || "DEMO_KEY";
const BASE_URL = "https://api.congress.gov/v3";
const CACHE_TTL = 3600000; // 1 hour cache
const LEGISLATORS_DIRECTORY_URL =
  "https://unitedstates.github.io/congress-legislators/legislators-current.json";
const CONTACT_CACHE_TTL = 0; // 12 * 60 * 60 * 1000; // 12 hours - set to 0 to force reload with terms

let cachedData = {
  senate: null,
  house: null,
  houseByState: null,
  timestamp: 0,
};

let cachedContactDirectory = {
  data: null,
  timestamp: 0,
};

async function fetchLegislatorContactDirectory() {
  const now = Date.now();
  if (
    cachedContactDirectory.data &&
    now - cachedContactDirectory.timestamp < CONTACT_CACHE_TTL
  ) {
    return cachedContactDirectory.data;
  }

  try {
    const response = await fetch(LEGISLATORS_DIRECTORY_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch legislator directory:",
        response.status,
        response.statusText
      );
      cachedContactDirectory.data = new Map();
      cachedContactDirectory.timestamp = now;
      return cachedContactDirectory.data;
    }

    const directory = await response.json();
    const contactMap = new Map();

    directory.forEach((person) => {
      const bioguideId = person?.id?.bioguide;
      if (!bioguideId) {
        return;
      }

      const terms = Array.isArray(person.terms) ? person.terms : [];
      const latestTerm = terms.length ? terms[terms.length - 1] : {};

      const phone =
        latestTerm?.phone?.trim() || person?.phone?.trim?.() || null;
      const contactForm =
        latestTerm?.contact_form || person?.contact_form || null;

      contactMap.set(bioguideId, {
        phone: phone || null,
        contactForm: contactForm || null,
        terms: person.terms || [],
      });
    });

    cachedContactDirectory = {
      data: contactMap,
      timestamp: now,
    };

    return contactMap;
  } catch (error) {
    console.error("Error fetching legislator directory:", error);
    cachedContactDirectory = {
      data: new Map(),
      timestamp: now,
    };
    return cachedContactDirectory.data;
  }
}

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
  const contactDirectory = await fetchLegislatorContactDirectory();

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
            const senatorData = senators.map((senator) => {
              const terms = Array.isArray(senator.terms.item)
                ? senator.terms.item
                : [senator.terms.item];
              const latestTerm = terms[terms.length - 1];
              const directoryEntry = contactDirectory.get(senator.bioguideId);
              const officePhone = directoryEntry?.phone || null;
              const contactForm = directoryEntry?.contactForm || null;

              return {
                name: senator.directOrderName || senator.name || "Unknown",
                party: normalizePartyName(senator.partyName),
                bioguideId: senator.bioguideId,
                depiction: senator.depiction?.imageUrl || null,
                startYear: latestTerm?.startYear || null,
                officePhone,
                contactForm,
              };
            });

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

async function fetchHouseDataByState() {
  const houseData = {};
  const currentCongress = getCurrentCongressNumber();
  const currentYear = new Date().getUTCFullYear();
  const contactDirectory = await fetchLegislatorContactDirectory();

  try {
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
        const state = member.state || "";

        // Skip territories
        if (US_TERRITORIES.includes(state)) {
          continue;
        }

        // Check if member has current House term
        if (!member.terms || !member.terms.item) {
          continue;
        }

        const terms = Array.isArray(member.terms.item)
          ? member.terms.item
          : [member.terms.item];

        const latestTerm = terms[terms.length - 1];
        const chamber = latestTerm?.chamber || "";
        const isHouse =
          chamber === "House of Representatives" ||
          chamber === "House" ||
          chamber.includes("House");

        if (!isHouse) {
          continue;
        }

        const endYearNum = latestTerm?.endYear
          ? Number(latestTerm.endYear)
          : null;
        const isCurrentMember = endYearNum === null || endYearNum > currentYear;

        if (!isCurrentMember) {
          continue;
        }

        // Get state code from full state name
        const stateCode = Object.keys(STATE_NAMES).find(
          (code) => STATE_NAMES[code] === state
        );

        if (!stateCode) continue;

        // Initialize state array if needed
        if (!houseData[stateCode]) {
          houseData[stateCode] = {
            name: STATE_NAMES[stateCode],
            representatives: [],
          };
        }

        // Extract district - check multiple possible locations in the API response
        let district = "At-Large";

        // Check various places where district might be stored
        const possibleDistrict =
          latestTerm?.district ||
          member.district ||
          member.partyHistory?.[0]?.district ||
          null;

        if (
          possibleDistrict !== undefined &&
          possibleDistrict !== null &&
          possibleDistrict !== ""
        ) {
          district = String(possibleDistrict);
        }

        let officePhone =
          latestTerm?.phone ||
          latestTerm?.contactInformation?.phone ||
          member.phone ||
          member.contactInformation?.phone ||
          member?.office?.phone ||
          null;

        const directoryEntry = contactDirectory.get(member.bioguideId);
        if (directoryEntry) {
          if (!officePhone && directoryEntry.phone) {
            officePhone = directoryEntry.phone;
          }
        }

        // Add representative
        houseData[stateCode].representatives.push({
          name: member.directOrderName || member.name || "Unknown",
          party: normalizePartyName(member.partyName),
          bioguideId: member.bioguideId,
          district: district,
          depiction: member.depiction?.imageUrl || null,
          startYear: latestTerm?.startYear || null,
          officePhone,
          contactForm: directoryEntry?.contactForm || null,
        });
      }

      offset += members.length || limit;
      if (!members.length) break;
    }

    // Sort representatives by district number
    Object.values(houseData).forEach((stateData) => {
      stateData.representatives.sort((a, b) => {
        const distA = a.district === "At-Large" ? 0 : parseInt(a.district) || 0;
        const distB = b.district === "At-Large" ? 0 : parseInt(b.district) || 0;
        return distA - distB;
      });
    });
  } catch (error) {
    console.error("Error fetching House data by state:", error);
  }

  return houseData;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'senate' or 'house' or 'all' or 'detailed'
  const flat =
    searchParams.get("flat") === "1" || searchParams.get("flat") === "true";
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const limit = limitParam ? Number(limitParam) : null;
  const offset = offsetParam ? Number(offsetParam) : 0;

  const now = Date.now();
  const isCacheValid = now - cachedData.timestamp < CACHE_TTL;

  try {
    if (type === "house" || type === "all" || type === "detailed") {
      if (!isCacheValid || !cachedData.house) {
        cachedData.house = await fetchHouseData();
        cachedData.timestamp = now;
      }
      if (type === "house") {
        return NextResponse.json(cachedData.house);
      }
    }

    if (type === "senate" || type === "all" || type === "detailed") {
      if (!isCacheValid || !cachedData.senate) {
        cachedData.senate = await fetchSenateData();
        cachedData.timestamp = now;
      }
      if (type === "senate") {
        return NextResponse.json(cachedData.senate);
      }
    }

    // Fetch detailed House data by state
    if (type === "detailed") {
      if (!isCacheValid || !cachedData.houseByState) {
        cachedData.houseByState = await fetchHouseDataByState();
        cachedData.timestamp = now;
      }
      // If flat/paginated list requested, return flattened members list with total
      if (flat) {
        // server-side flatten, filter, sort and paginate
        const q = searchParams.get("q")?.trim()?.toLowerCase() || null;
        const stateFilter = (searchParams.get("state") || "all").toUpperCase();
        const partyFilter = (searchParams.get("party") || "all").toLowerCase();
        const chamberFilter = (
          searchParams.get("chamber") || "all"
        ).toLowerCase();
        const sort = searchParams.get("sort") || "az";

        const list = [];

        // Flatten senate
        const senate = cachedData.senate || {};
        Object.entries(senate).forEach(([stateCode, stateDataRaw]) => {
          const stateData = stateDataRaw || {};
          (stateData?.senators || []).forEach((s) => {
            list.push({
              id: s.bioguideId || `${s.name}-${stateCode}-senate`,
              name: s.name,
              party: s.party,
              state: stateData?.name || stateCode,
              stateCode,
              district: "Senator",
              chamber: "senate",
              portraitUrl: s.depiction || s.depiction?.imageUrl || null,
            });
          });
        });

        // Flatten house
        const houseByState = cachedData.houseByState || {};
        Object.entries(houseByState).forEach(([stateCode, stateDataRaw]) => {
          const stateData = stateDataRaw || {};
          (stateData?.representatives || []).forEach((r) => {
            list.push({
              id: r.bioguideId || `${r.name}-${stateCode}-house`,
              name: r.name,
              party: r.party,
              state: stateData?.name || stateCode,
              stateCode,
              district: r.district || null,
              chamber: "house",
              portraitUrl: r.depiction || r.depiction?.imageUrl || null,
            });
          });
        });

        // Apply search & filters
        let filteredList = list.filter((m) => {
          if (q) {
            if (!m.name || !m.name.toLowerCase().includes(q)) return false;
          }

          if (stateFilter && stateFilter !== "ALL") {
            if (String(m.stateCode || "").toUpperCase() !== stateFilter)
              return false;
          }

          if (partyFilter && partyFilter !== "all") {
            // partyFilter may be one-letter code (d,r,i) from client; map to full name for comparison
            let want = partyFilter;
            if (partyFilter.length === 1) {
              if (partyFilter === "d") want = "democrat";
              if (partyFilter === "r") want = "republican";
              if (partyFilter === "i") want = "independent";
            }
            const memberParty = (m.party || "").toLowerCase();
            if (!memberParty.includes(want)) return false;
          }

          if (chamberFilter && chamberFilter !== "all") {
            if ((m.chamber || "").toLowerCase() !== chamberFilter) return false;
          }

          return true;
        });

        // Add yearsInService from legislators directory
        // The legislators JSON may use different field names for term start years
        // (e.g. 'start', 'start_year', 'startYear'). Extract robustly.
        const contactDirectory = await fetchLegislatorContactDirectory();
        const currentYear = new Date().getUTCFullYear();

        const extractStartYear = (t) => {
          if (!t) return null;
          // common variants
          if (t.startYear || t.start_year) {
            const v = t.startYear ?? t.start_year;
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
          }
          // ISO date like '2019-01-03' or similar
          if (t.start) {
            const m = String(t.start).match(/^(\d{4})/);
            if (m) return Number(m[1]);
          }
          if (t.begin) {
            const m = String(t.begin).match(/^(\d{4})/);
            if (m) return Number(m[1]);
          }
          return null;
        };

        filteredList.forEach((member) => {
          const bioId = member.id;
          const entry = contactDirectory.get(bioId);
          let years = 0;
          if (entry && entry.terms) {
            const terms = Array.isArray(entry.terms) ? entry.terms : [];
            const startYears = terms
              .map((t) => extractStartYear(t))
              .filter((y) => y != null)
              .sort((a, b) => a - b);
            if (startYears.length > 0) {
              years = currentYear - startYears[0];
            }
          }
          member.yearsInService = years;
        });

        // sort
        if (sort === "az") {
          filteredList.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === "za") {
          filteredList.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sort === "years-asc") {
          filteredList.sort(
            (a, b) => (a.yearsInService || 0) - (b.yearsInService || 0)
          );
        } else if (sort === "years-desc") {
          filteredList.sort(
            (a, b) => (b.yearsInService || 0) - (a.yearsInService || 0)
          );
        } else {
          filteredList.sort((a, b) => a.name.localeCompare(b.name));
        }

        const total = filteredList.length;
        let items = filteredList;
        if (limit != null) {
          const start = Math.max(0, offset || 0);
          items = filteredList.slice(start, start + Math.max(0, limit));
        }

        return NextResponse.json({ total, items });
      }

      return NextResponse.json({
        senate: cachedData.senate,
        house: cachedData.house,
        houseByState: cachedData.houseByState,
      });
    }

    // Return all data (legacy support)
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

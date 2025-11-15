// Archived: possible-unused
// Moved from src/utils/loadDistrictBoundaries.js on branch cleanup/safe-refactor-20251115T000000
// Client-side loader for per-state congressional district GeoJSON.
// Kept in archive because there were no imports referencing it in the repository.

export async function loadDistrictGeoJSON(stateCode, congress = 118) {
  if (typeof window === "undefined") return null;
  try {
    const base =
      (typeof process !== "undefined" &&
        process.env &&
        process.env.NEXT_PUBLIC_GEO_URL) ||
      "";
    const baseClean = base ? String(base).replace(/\/$/, "") : "";
    const url = baseClean
      ? `${baseClean}/data/cd${congress}/${stateCode}.geojson`
      : `/data/cd${congress}/${stateCode}.geojson`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (
      !data ||
      data.type !== "FeatureCollection" ||
      !Array.isArray(data.features)
    ) {
      return null;
    }
    return data;
  } catch (e) {
    console.warn("Failed to load district GeoJSON for", stateCode, e);
    return null;
  }
}

// Client-side loader for per-state congressional district GeoJSON.
// Expected path for local static files:
//   public/data/cd118/CA.geojson (or cd{congress}/{STATE}.geojson)
// Returns a parsed GeoJSON FeatureCollection or null if missing.

export async function loadDistrictGeoJSON(stateCode, congress = 118) {
  if (typeof window === "undefined") return null;
  try {
    const url = `/data/cd${congress}/${stateCode}.geojson`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    // Minimal validation
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

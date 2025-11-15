// Client-side loader for per-state congressional district GeoJSON.
// Expected path for local static files:
//   public/data/cd118/CA.geojson (or cd{congress}/{STATE}.geojson)
// Returns a parsed GeoJSON FeatureCollection or null if missing.

export async function loadDistrictGeoJSON(stateCode, congress = 118) {
  if (typeof window === "undefined") return null;
  try {
    // Allow runtime override via NEXT_PUBLIC_GEO_URL (set in Vercel or .env)
    // If provided, we expect the hosted data to live under
    //   <NEXT_PUBLIC_GEO_URL>/data/cd{congress}/{STATE}.geojson
    // (this mirrors the default local `public/data/...` layout)
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

"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { AnimatePresence, motion } from "framer-motion";
import { getControlColor } from "@/services/congressApi";
import { FIPS_TO_STATE_CODE, STATE_NAME_TO_CODE } from "@/utils/stateData";
import { GiCapitol } from "react-icons/gi";
import { MdAccountBalance } from "react-icons/md";
import { FaRepublican, FaDemocrat, FaFlagUsa } from "react-icons/fa";
import Image from "next/image";
import SenatePanel from "./SenatePanel";
import HousePanel from "./HousePanel";
import styles from "./LegislativeMap.module.css";

const statesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
// Congressional districts: allow runtime override via NEXT_PUBLIC_GEO_URL.
// If set, we expect a combined districts file at `${NEXT_PUBLIC_GEO_URL}/districts118.json`.
const _GEO_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.NEXT_PUBLIC_GEO_URL) ||
  "";
const districtsGeoUrl = _GEO_BASE
  ? `${String(_GEO_BASE).replace(/\/$/, "")}/districts118.json`
  : "/districts118.json";

const resolveStateAbbreviation = (properties = {}) => {
  return (
    properties.STATE ||
    properties.STUSAB ||
    properties.STATE_ABBR ||
    properties.STATEAB ||
    properties.state ||
    (properties.STATEFP ? FIPS_TO_STATE_CODE[properties.STATEFP] : null)
  );
};

const normalizeDistrictKey = (district) => {
  if (district === "00" || district === "0" || district === 0) {
    return "0";
  }

  if (
    typeof district === "string" &&
    district.toLowerCase().replace(/[-_\s]/g, "") === "atlarge"
  ) {
    return "0";
  }

  const numeric = parseInt(district, 10);
  if (!Number.isNaN(numeric)) {
    return String(numeric);
  }

  return typeof district === "string" ? district : null;
};

const getStateCodeFromId = (id) => FIPS_TO_STATE_CODE[id];

const getStateCodeFromName = (name) => STATE_NAME_TO_CODE[name];

const DEFAULT_POSITION = {
  coordinates: [-97, 40],
  zoom: 1,
};

export default function LegislativeMap({
  senateComposition,
  senateBreakdown,
  houseBreakdown,
  houseByState,
  legislativeView,
  onLegislativeViewChange,
}) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  // Show the interaction hint in the composition panel
  const [showHint, setShowHint] = useState(true);
  // Featured representative id for highlighting a district card (house view)
  const [featuredHouseRepId, setFeaturedHouseRepId] = useState(null);
  const [selectedState, setSelectedState] = useState(null); // State code (e.g., 'CA')
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [caucusFilter, setCaucusFilter] = useState(null); // 'republican', 'democratic', or null
  const [districtData, setDistrictData] = useState(null);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const districtFeaturesCacheRef = useRef(null);
  const filteredDistrictCacheRef = useRef(new Map());
  const districtFetchPromiseRef = useRef(null);
  const districtIndexRef = useRef(new Map());
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 968);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile overlay expanded state (when user drags up)
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Ref to manage delayed close when animating panel back down
  const closeTimeoutRef = useRef(null);
  const CLOSE_ANIMATION_MS = 320; // slightly longer than motion transition to ensure animation completes

  // Prevent background scrolling when overlay fully expanded
  useEffect(() => {
    if (mobileExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileExpanded]);

  // cleanup any pending close timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, []);

  const loadDistrictFeatures = useCallback(async () => {
    if (districtFeaturesCacheRef.current) {
      return districtFeaturesCacheRef.current;
    }

    if (!districtFetchPromiseRef.current) {
      districtFetchPromiseRef.current = fetch(districtsGeoUrl).then((res) =>
        res.json()
      );
    }

    const data = await districtFetchPromiseRef.current;
    const features = data?.features || [];
    districtFeaturesCacheRef.current = features;

    if (districtIndexRef.current.size === 0) {
      const index = districtIndexRef.current;
      features.forEach((feature) => {
        const stateCode = resolveStateAbbreviation(feature.properties || {});
        if (!stateCode) return;
        if (!index.has(stateCode)) {
          index.set(stateCode, []);
        }
        index.get(stateCode).push(feature);
      });
    }

    return features;
  }, []);

  const houseStateSummary = useMemo(() => {
    const summary = {};

    if (!houseByState) {
      return summary;
    }

    Object.entries(houseByState).forEach(([stateCode, stateData]) => {
      let republican = 0;
      let democratic = 0;

      stateData?.representatives?.forEach((rep) => {
        if (rep.party === "Republican") {
          republican++;
        } else if (rep.party === "Democrat") {
          democratic++;
        }
      });

      summary[stateCode] = {
        republican,
        democratic,
        name: stateData?.name || stateCode,
        total: stateData?.representatives?.length || 0,
      };
    });

    return summary;
  }, [houseByState]);

  const districtRepLookup = useMemo(() => {
    if (legislativeView !== "house" || !selectedState) {
      return null;
    }

    const stateData = houseByState[selectedState];
    const map = new Map();

    stateData?.representatives?.forEach((rep) => {
      const key = normalizeDistrictKey(rep.district);
      if (key) {
        map.set(key, rep);
      }
    });

    return map;
  }, [legislativeView, selectedState, houseByState]);

  // Get current breakdown based on legislative view
  const currentBreakdown =
    legislativeView === "house" ? houseBreakdown : senateBreakdown;

  // Prefetch district geometry so it is ready when needed
  useEffect(() => {
    let isCancelled = false;

    loadDistrictFeatures().catch((err) => {
      if (!isCancelled) {
        console.error("❌ Error preloading district data:", err);
        districtFetchPromiseRef.current = null;
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [loadDistrictFeatures]);

  // Load and filter district data only for the selected state
  useEffect(() => {
    if (legislativeView !== "house") {
      setFeaturedHouseRepId(null);
      setDistrictData(null);
      setIsLoadingDistricts(false);
      return;
    }

    if (!selectedState) {
      setFeaturedHouseRepId(null);
      setDistrictData(null);
      setIsLoadingDistricts(false);
      return;
    }

    let isCancelled = false;

    const cachedGeoJSON = filteredDistrictCacheRef.current.get(selectedState);
    if (cachedGeoJSON) {
      setDistrictData(cachedGeoJSON);
      setIsLoadingDistricts(false);
      return;
    }

    const indexedFeatures = districtIndexRef.current.get(selectedState);
    if (indexedFeatures && indexedFeatures.length) {
      const filteredGeoJSON = {
        type: "FeatureCollection",
        features: [...indexedFeatures],
      };
      filteredDistrictCacheRef.current.set(selectedState, filteredGeoJSON);
      setDistrictData(filteredGeoJSON);
      setIsLoadingDistricts(false);
      return;
    }

    const ensureDistrictFeatures = async () => {
      setIsLoadingDistricts(true);
      try {
        await loadDistrictFeatures();
        if (isCancelled) {
          return;
        }

        const indexedFeatures = districtIndexRef.current.get(selectedState);
        const filteredFeatures = indexedFeatures ? [...indexedFeatures] : [];

        const filteredGeoJSON = {
          type: "FeatureCollection",
          features: filteredFeatures,
        };

        if (!filteredFeatures.length) {
          console.warn(
            `⚠️ No districts found for ${selectedState} using cached geometry.`
          );
        }

        if (!isCancelled) {
          filteredDistrictCacheRef.current.set(selectedState, filteredGeoJSON);
          setDistrictData(filteredGeoJSON);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("❌ Error loading district data:", err);
          setDistrictData(null);
        }
        districtFetchPromiseRef.current = null;
      } finally {
        if (!isCancelled) {
          setIsLoadingDistricts(false);
        }
      }
    };

    ensureDistrictFeatures();

    return () => {
      isCancelled = true;
    };
  }, [legislativeView, selectedState, loadDistrictFeatures]);

  // Extract state code from congressional district properties
  const getDistrictInfo = useCallback(
    (properties) => {
      if (legislativeView !== "house" || !properties) return null;

      // Try different property names for district
      const district =
        properties.CD119FP || // Census Bureau 119th Congress format (current)
        properties.CD118FP || // Census Bureau 118th Congress format
        properties.DISTRICT ||
        properties.CDISTRICT ||
        properties.district ||
        properties.CD;

      const finalStateCode = resolveStateAbbreviation(properties);

      const hasDistrictField = Boolean(
        properties.CD119FP ||
          properties.CD118FP ||
          properties.DISTRICT ||
          properties.CDISTRICT ||
          properties.district ||
          properties.CD
      );

      if (hasDistrictField && (!finalStateCode || !district)) {
        console.warn("⚠️ Could not parse district info:", properties);
      }

      return {
        stateCode: finalStateCode,
        district: district,
      };
    },
    [legislativeView]
  );

  const handleMouseEnter = useCallback(
    (geo, event) => {
      const { name, id } = geo.properties;

      // Handle House view
      if (legislativeView === "house") {
        // If state is selected, show district tooltips
        if (selectedState) {
          const districtInfo = getDistrictInfo(geo.properties);
          if (!districtInfo?.stateCode) return;

          let rep = null;
          if (districtInfo.stateCode === selectedState && districtRepLookup) {
            const key = normalizeDistrictKey(districtInfo.district);
            if (key) {
              rep = districtRepLookup.get(key) || null;
            }
          }

          if (!rep) {
            const stateData = houseByState[districtInfo.stateCode];
            rep = stateData?.representatives?.find((r) => {
              const key = normalizeDistrictKey(districtInfo.district);
              const repKey = normalizeDistrictKey(r.district);
              return key && repKey ? key === repKey : false;
            });
          }

          if (rep) {
            const districtLabel =
              rep.district === "At-Large"
                ? `${districtInfo.stateCode} At-Large`
                : `${districtInfo.stateCode}-${String(rep.district).padStart(
                    2,
                    "0"
                  )}`;

            const content = `${districtLabel}\n${rep.name} (${rep.party.charAt(
              0
            )})`;
            setTooltipContent(content);
            setTooltipPosition({ x: event.clientX, y: event.clientY });
            setShowTooltip(true);
          }
          return;
        } else {
          // No state selected - show state-level info
          const stateCode =
            getStateCodeFromId(id) || getStateCodeFromName(name);
          const summary = houseStateSummary[stateCode];

          if (summary) {
            const content = `${summary.name}\nR: ${summary.republican} | D: ${summary.democratic}`;
            setTooltipContent(content);
            setTooltipPosition({ x: event.clientX, y: event.clientY });
            setShowTooltip(true);
          }
          return;
        }
      }

      // Senate view - show state senators
      const stateCode = getStateCodeFromId(id) || getStateCodeFromName(name);
      const senateData = senateComposition[stateCode];

      if (
        senateData &&
        senateData.senators &&
        senateData.senators.length >= 2
      ) {
        const senator1 = senateData.senators[0];
        const senator2 = senateData.senators[1];

        // Filter senators based on caucus filter
        let displayedSenators = [];

        if (caucusFilter === "republican") {
          // Only show Republican senators
          if (senator1.party === "Republican") displayedSenators.push(senator1);
          if (senator2.party === "Republican") displayedSenators.push(senator2);
        } else if (caucusFilter === "democratic") {
          // Only show Democratic caucus senators (Dem + Ind)
          if (senator1.party === "Democrat" || senator1.party === "Independent")
            displayedSenators.push(senator1);
          if (senator2.party === "Democrat" || senator2.party === "Independent")
            displayedSenators.push(senator2);
        } else {
          // No filter - show all senators
          displayedSenators = [senator1, senator2];
        }

        // Build tooltip content
        let content = senateData.name;
        displayedSenators.forEach((senator) => {
          content += `\n${senator.name} (${senator.party.charAt(0)})`;
        });

        if (displayedSenators.length > 0) {
          setTooltipContent(content);
          setTooltipPosition({ x: event.clientX, y: event.clientY });
          setShowTooltip(true);
        }
      } else if (
        senateData &&
        senateData.senators &&
        senateData.senators.length === 1
      ) {
        const senator1 = senateData.senators[0];

        // Check if this senator matches the filter
        let shouldShow = true;
        if (caucusFilter === "republican" && senator1.party !== "Republican") {
          shouldShow = false;
        } else if (
          caucusFilter === "democratic" &&
          senator1.party !== "Democrat" &&
          senator1.party !== "Independent"
        ) {
          shouldShow = false;
        }

        if (shouldShow) {
          setTooltipContent(
            `${senateData.name}\n${senator1.name} (${senator1.party.charAt(
              0
            )})\n(One vacancy)`
          );
          setTooltipPosition({ x: event.clientX, y: event.clientY });
          setShowTooltip(true);
        }
      }
    },
    [
      senateComposition,
      caucusFilter,
      legislativeView,
      houseStateSummary,
      houseByState,
      districtRepLookup,
      getDistrictInfo,
      selectedState,
    ]
  );

  // Throttle mouse move for better performance
  const handleMouseMove = useCallback((event) => {
    // Only update position every 150ms to reduce re-renders (especially for districts)
    if (!window.lastMouseMove || Date.now() - window.lastMouseMove > 150) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
      window.lastMouseMove = Date.now();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const getCaucusControl = useCallback((senateData) => {
    if (!senateData || !senateData.senators) return null;

    let repCount = 0;
    let demCount = 0;

    senateData.senators.forEach((senator) => {
      if (senator.party === "Republican") {
        repCount++;
      } else if (
        senator.party === "Democrat" ||
        senator.party === "Independent"
      ) {
        // Independents caucus with Democrats (Sanders & King)
        demCount++;
      }
    });

    if (repCount === 2) return "republican";
    if (demCount === 2) return "democratic";
    return "split";
  }, []);

  const getFillColor = useCallback(
    (geo) => {
      const { name, id } = geo.properties;

      // Handle House view
      if (legislativeView === "house") {
        // Check if this is a district geography (has district properties)
        const districtInfo = getDistrictInfo(geo.properties);
        const isDistrictGeo = districtInfo && districtInfo.district;

        // If this is district geometry, color by individual representative
        if (isDistrictGeo) {
          let rep = null;

          if (districtInfo.stateCode === selectedState && districtRepLookup) {
            const key = normalizeDistrictKey(districtInfo.district);
            if (key) {
              rep = districtRepLookup.get(key) || null;
            }
          }

          if (!rep) {
            const stateData = houseByState[districtInfo.stateCode];
            rep =
              stateData?.representatives?.find((candidate) => {
                const candidateKey = normalizeDistrictKey(candidate.district);
                const districtKey = normalizeDistrictKey(districtInfo.district);
                return districtKey && candidateKey
                  ? districtKey === candidateKey
                  : false;
              }) || null;
          }

          if (!rep) return "#E0E1DD";

          // Color by representative's party
          if (rep.party === "Republican") return "#DC143C";
          if (rep.party === "Democrat") return "#1E90FF";
          return "#E0E1DD";
        }

        // This is state geometry - show state-level party control
        const stateCode = getStateCodeFromId(id) || getStateCodeFromName(name);
        const stateSummary = houseStateSummary[stateCode];

        if (!stateSummary) return "#E0E1DD";

        // Color by majority party
        if (stateSummary.republican > stateSummary.democratic) return "#DC143C"; // Republican majority
        if (stateSummary.democratic > stateSummary.republican) return "#1E90FF"; // Democratic majority
        return "url(#stripes)"; // Tie - use stripe pattern
      }

      // Senate view - existing logic
      const stateCode = getStateCodeFromId(id) || getStateCodeFromName(name);
      const senateData = senateComposition[stateCode];

      if (!senateData) return "#E0E1DD";

      // If filtering by caucus
      if (caucusFilter && legislativeView === "senate") {
        const caucusControl = getCaucusControl(senateData);

        if (caucusFilter === "republican") {
          // Show red for states with at least one Republican senator
          // Gray out Democratic caucus states
          if (caucusControl === "republican" || caucusControl === "split") {
            return "#DC143C";
          }
          return "#E8E8E8";
        } else if (caucusFilter === "democratic") {
          // Show blue for states with at least one Democratic caucus senator
          // Gray out pure Republican states
          if (caucusControl === "democratic" || caucusControl === "split") {
            return "#1E90FF";
          }
          return "#E8E8E8";
        }
      }

      // Default coloring based on caucus alignment
      if (legislativeView === "senate") {
        const caucusControl = getCaucusControl(senateData);
        if (caucusControl === "republican") return "#DC143C";
        if (caucusControl === "democratic") return "#1E90FF";
        // For split, return a pattern identifier
        if (caucusControl === "split") return "url(#stripes)";
      }

      return getControlColor(senateData.control);
    },
    [
      senateComposition,
      houseStateSummary,
      caucusFilter,
      legislativeView,
      getCaucusControl,
      getDistrictInfo,
      districtRepLookup,
      houseByState,
      selectedState,
    ]
  );

  const handleStateClick = useCallback(
    (geo) => {
      const { name, id } = geo.properties;

      // Get state code based on view type
      let stateCode;
      if (legislativeView === "house") {
        const districtInfo = getDistrictInfo(geo.properties);
        const isDistrictGeo = Boolean(districtInfo?.district);

        if (isDistrictGeo) {
          stateCode = districtInfo?.stateCode;
        } else {
          stateCode = getStateCodeFromId(id) || getStateCodeFromName(name);
        }
      } else {
        stateCode = getStateCodeFromId(id) || getStateCodeFromName(name);
      }

      if (!stateCode) return;

      if (stateCode !== selectedState) {
        setFeaturedHouseRepId(null);
      }

      // Calculate centroid
      const centroid = geoCentroid(geo);

      // Set position to zoom - zoom more for districts
      setPosition({
        coordinates: centroid,
        zoom: legislativeView === "house" ? 5 : 3,
      });

      setSelectedState(stateCode);
      setShowTooltip(false);
    },
    [legislativeView, selectedState, getDistrictInfo]
  );

  const handleCloseSidebar = useCallback(() => {
    setSelectedState(null);
    setFeaturedHouseRepId(null);
    // Reset to default US view
    setPosition(DEFAULT_POSITION);
  }, []);

  // Close overlay by animating to collapsed state first, then clearing selection
  const closeWithAnimation = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // animate to collapsed
    setMobileExpanded(false);

    // after the animation completes, close the sidebar (clear selected state)
    closeTimeoutRef.current = setTimeout(() => {
      handleCloseSidebar();
      closeTimeoutRef.current = null;
    }, CLOSE_ANIMATION_MS);
  }, [handleCloseSidebar]);

  const handleMoveEnd = useCallback((position) => {
    setPosition(position);
  }, []);

  // Get members for selected state
  const selectedStateMembers = useMemo(() => {
    if (!selectedState) return null;

    if (legislativeView === "senate") {
      return senateComposition[selectedState] || null;
    } else {
      return houseByState[selectedState] || null;
    }
  }, [selectedState, legislativeView, senateComposition, houseByState]);

  return (
    <div className={styles.legislativeView}>
      <div className={styles.legislativeSubNav}>
        <button
          className={`${styles.subNavButton} ${
            legislativeView === "senate" ? styles.active : ""
          }`}
          onClick={() => {
            onLegislativeViewChange("senate");
            setCaucusFilter(null);
            setFeaturedHouseRepId(null);
          }}
        >
          <GiCapitol size={20} />
          <span>Senate</span>
        </button>
        <button
          className={`${styles.subNavButton} ${
            legislativeView === "house" ? styles.active : ""
          }`}
          onClick={() => {
            onLegislativeViewChange("house");
            setCaucusFilter(null);
            setFeaturedHouseRepId(null);
          }}
        >
          <MdAccountBalance size={20} />
          <span>House</span>
        </button>
      </div>

      <div className={styles.contentContainer}>
        <div
          className={`${styles.mapSection} ${
            selectedState ? styles.stateSelected : ""
          }`}
        >
          <div className={styles.mapContainer}>
            {isLoadingDistricts && (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingContent}>
                  <div className={styles.spinner}></div>
                  <p className={styles.loadingText}>
                    Loading districts for {selectedState}...
                  </p>
                </div>
              </div>
            )}
            <ComposableMap
              projection="geoAlbersUsa"
              projectionConfig={{
                scale: 1000,
              }}
              width={1000}
              height={600}
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                onMoveEnd={handleMoveEnd}
                minZoom={1}
                maxZoom={8}
                transitionDuration={400}
              >
                <defs>
                  <pattern
                    id="stripes"
                    patternUnits="userSpaceOnUse"
                    width="8"
                    height="8"
                    patternTransform="rotate(0)"
                  >
                    <rect width="4" height="8" fill="#DC143C" />
                    <rect x="4" width="4" height="8" fill="#1E90FF" />
                  </pattern>
                </defs>

                {/* Always show state boundaries as base layer */}
                <Geographies geography={statesGeoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const { name, id } = geo.properties;
                      const stateCode =
                        getStateCodeFromId(id) || getStateCodeFromName(name);
                      const isSelectedState =
                        selectedState && stateCode === selectedState;

                      // Cache fill color to avoid recalculating on every style property
                      let fillColor = getFillColor(geo);

                      // Pre-calculate styling values
                      const isHouse = legislativeView === "house";

                      // Don't show the selected state if we're showing its districts
                      if (isHouse && isSelectedState && districtData) {
                        // When showing districts, make state fill transparent to show districts underneath
                        // but keep the stroke for highlighting
                        fillColor = "none";
                      }

                      const strokeWidth = isSelectedState ? 3 : 0.75;

                      const strokeColor = isSelectedState
                        ? "#ffffff"
                        : "#415A77";

                      // Memoize event handlers per geography
                      const handleClick = () => handleStateClick(geo);
                      const handleEnter = (event) =>
                        handleMouseEnter(geo, event);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={handleEnter}
                          onMouseLeave={handleMouseLeave}
                          onClick={handleClick}
                          style={{
                            default: {
                              fill: fillColor,
                              stroke: strokeColor,
                              strokeWidth: strokeWidth,
                              outline: "none",
                              cursor: "pointer",
                              opacity:
                                selectedState && !isSelectedState ? 0.3 : 1,
                              pointerEvents:
                                selectedState && isSelectedState && districtData
                                  ? "none"
                                  : "auto",
                              transition: "none",
                            },
                            hover: {
                              fill: fillColor,
                              stroke: isSelectedState ? "#ffffff" : "#1B263B",
                              strokeWidth: isSelectedState ? 3 : 1.5,
                              outline: "none",
                              opacity:
                                selectedState && !isSelectedState ? 0.5 : 0.95,
                              cursor: "pointer",
                              transition: "none",
                            },
                            pressed: {
                              fill: fillColor,
                              stroke: "#1B263B",
                              strokeWidth: isSelectedState ? 3 : 1.5,
                              outline: "none",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>

                {/* Show districts for selected state in House view */}
                {legislativeView === "house" &&
                  selectedState &&
                  districtData && (
                    <Geographies geography={districtData}>
                      {({ geographies }) => {
                        return geographies.map((geo) => {
                          const districtInfo = getDistrictInfo(geo.properties);
                          if (!districtInfo?.stateCode) {
                            return null;
                          }

                          let rep = null;
                          if (districtInfo.stateCode === selectedState) {
                            const key = normalizeDistrictKey(
                              districtInfo.district
                            );
                            if (key && districtRepLookup) {
                              rep = districtRepLookup.get(key) || null;
                            }
                          }

                          if (!rep) {
                            const stateData =
                              houseByState[districtInfo.stateCode];
                            rep =
                              stateData?.representatives?.find((r) => {
                                const candidateKey = normalizeDistrictKey(
                                  r.district
                                );
                                const districtKey = normalizeDistrictKey(
                                  districtInfo.district
                                );
                                return (
                                  candidateKey &&
                                  districtKey &&
                                  candidateKey === districtKey
                                );
                              }) || null;
                          }

                          if (!rep) {
                            return null;
                          }

                          // Color by representative's party
                          let fillColor = "#E0E1DD";
                          if (rep.party === "Republican") fillColor = "#DC143C";
                          else if (rep.party === "Democrat")
                            fillColor = "#1E90FF";

                          const isFeaturedDistrict =
                            rep.bioguideId === featuredHouseRepId;
                          const hasFeaturedDistrict =
                            Boolean(featuredHouseRepId);
                          const dimmedOpacity = hasFeaturedDistrict
                            ? isFeaturedDistrict
                              ? 1
                              : 0.25
                            : 0.95;
                          const hoverOpacity = hasFeaturedDistrict
                            ? isFeaturedDistrict
                              ? 1
                              : 0.45
                            : 0.95;
                          const strokeColor = isFeaturedDistrict
                            ? "#ffffff"
                            : "#415A77";
                          const strokeWidth = isFeaturedDistrict ? 1.5 : 0.5;

                          const handleClick = () => {
                            if (rep?.bioguideId) {
                              setFeaturedHouseRepId(rep.bioguideId);
                            }
                            handleStateClick(geo);
                          };
                          const handleEnter = (event) =>
                            handleMouseEnter(geo, event);

                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onMouseEnter={handleEnter}
                              onMouseLeave={handleMouseLeave}
                              onClick={handleClick}
                              style={{
                                default: {
                                  fill: fillColor,
                                  stroke: strokeColor,
                                  strokeWidth: strokeWidth,
                                  outline: "none",
                                  cursor: "pointer",
                                  transition:
                                    "opacity 200ms ease, fill-opacity 200ms ease, stroke 200ms ease, stroke-width 200ms ease",
                                  opacity: dimmedOpacity,
                                  fillOpacity: dimmedOpacity,
                                },
                                hover: {
                                  fill: fillColor,
                                  stroke: "#1B263B",
                                  strokeWidth: isFeaturedDistrict ? 1.6 : 1,
                                  outline: "none",
                                  opacity: hoverOpacity,
                                  fillOpacity: hoverOpacity,
                                  cursor: "pointer",
                                  transition:
                                    "opacity 200ms ease, fill-opacity 200ms ease, stroke 200ms ease, stroke-width 200ms ease",
                                },
                                pressed: {
                                  fill: fillColor,
                                  stroke: "#1B263B",
                                  strokeWidth: 1,
                                  outline: "none",
                                },
                              }}
                            />
                          );
                        });
                      }}
                    </Geographies>
                  )}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          <div className={styles.zoomControls}>
            <button
              className={styles.zoomButton}
              onClick={() =>
                setPosition((pos) => ({
                  ...pos,
                  zoom: Math.max(pos.zoom / 1.5, 1),
                }))
              }
              aria-label="Zoom out"
            >
              −
            </button>
            <button className={styles.zoomButton} onClick={handleCloseSidebar}>
              Reset View
            </button>
            <button
              className={styles.zoomButton}
              onClick={() =>
                setPosition((pos) => ({
                  ...pos,
                  zoom: Math.min(pos.zoom * 1.5, 8),
                }))
              }
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>

        {selectedState && isMobile && (
          <AnimatePresence>
            <motion.div
              className={styles.mobileOverlayPanel}
              variants={{
                // Collapsed shows only ~20% of the panel (y = 80% pushed down)
                collapsed: { y: "80%" },
                expanded: { y: 0 },
                exit: { y: "100%" },
              }}
              initial={mobileExpanded ? "expanded" : "collapsed"}
              animate={mobileExpanded ? "expanded" : "collapsed"}
              exit="exit"
              transition={{ type: "tween", duration: 0.28 }}
              drag="y"
              dragElastic={0.18}
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(event, info) => {
                // If dragged up by more than 60px, expand; if dragged down by >60px, collapse
                if (info.offset && info.offset.y < -60) {
                  setMobileExpanded(true);
                } else if (info.offset && info.offset.y > 60) {
                  setMobileExpanded(false);
                }
              }}
              // When collapsed, keep the panel from intercepting map interactions; the grab handle below remains interactive
              style={{
                pointerEvents: mobileExpanded ? "auto" : "none",
                touchAction: "none",
              }}
            >
              <button
                className={styles.backButton}
                onClick={() => {
                  closeWithAnimation();
                }}
              >
                ← Back to Map
              </button>
              {selectedStateMembers ? (
                legislativeView === "senate" ? (
                  <div style={{ overflow: mobileExpanded ? "auto" : "hidden" }}>
                    <SenatePanel
                      stateData={selectedStateMembers}
                      onClose={() => {
                        closeWithAnimation();
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ overflow: mobileExpanded ? "auto" : "hidden" }}>
                    <HousePanel
                      stateData={selectedStateMembers}
                      onClose={() => {
                        closeWithAnimation();
                      }}
                      featuredRepresentativeId={featuredHouseRepId}
                      onRepresentativeFocus={setFeaturedHouseRepId}
                    />
                  </div>
                )
              ) : null}
            </motion.div>

            {!mobileExpanded && (
              <div
                className={styles.overlayGrabHandle}
                role="button"
                tabIndex={0}
                aria-label="Open details"
                onClick={() => setMobileExpanded(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setMobileExpanded(true);
                }}
              >
                <div className={styles.grabBar} />
                <div className={styles.grabLabel}>Details</div>
              </div>
            )}
          </AnimatePresence>
        )}

        {!(selectedState && isMobile) && (
          <div className={styles.breakdownPanel}>
            {selectedState && selectedStateMembers ? (
              legislativeView === "senate" ? (
                <SenatePanel
                  stateData={selectedStateMembers}
                  onClose={handleCloseSidebar}
                />
              ) : (
                <HousePanel
                  stateData={selectedStateMembers}
                  onClose={handleCloseSidebar}
                  featuredRepresentativeId={featuredHouseRepId}
                  onRepresentativeFocus={setFeaturedHouseRepId}
                />
              )
            ) : (
              // Show composition breakdown
              <AnimatePresence mode="wait">
                <motion.div
                  key={legislativeView}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className={styles.panelHeader}>
                    {legislativeView === "senate" ? (
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Seal_of_the_United_States_Senate.svg"
                        alt="Seal of the United States Senate"
                        width={80}
                        height={80}
                        className={styles.chamberSeal}
                        sizes="(max-width: 640px) 64px, 80px"
                        priority
                      />
                    ) : (
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Seal_of_the_United_States_House_of_Representatives.svg"
                        alt="Seal of the United States House of Representatives"
                        width={80}
                        height={80}
                        className={styles.chamberSeal}
                        sizes="(max-width: 640px) 64px, 80px"
                        priority
                      />
                    )}
                    <div className={styles.panelHeaderInner}>
                      <h3>
                        {legislativeView === "senate"
                          ? "Senate Composition"
                          : "House Composition"}
                      </h3>
                    </div>
                    <div className={styles.totalSeats}>
                      {legislativeView === "senate" ? "100" : "435"} Total Seats
                    </div>
                  </div>

                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        className={styles.interactionHint}
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <div className={styles.hintContent}>
                          <span className={styles.hintIcon}>💡</span>
                          <span className={styles.hintText}>
                            Click any state on the map to view its{" "}
                            {legislativeView === "senate"
                              ? "Senators"
                              : "Representatives"}
                            {", then click their card for more details"}
                          </span>
                        </div>
                        <button
                          className={styles.dismissHint}
                          onClick={() => setShowHint(false)}
                          aria-label="Dismiss hint"
                        >
                          ✕
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={styles.breakdownStats}>
                    <div
                      className={`${styles.statCard} ${
                        legislativeView === "senate" ? styles.clickable : ""
                      } ${
                        caucusFilter === "republican" ? styles.activeFilter : ""
                      }`}
                      style={{ borderTopColor: "#DC143C" }}
                      onClick={() => {
                        if (legislativeView === "senate") {
                          setCaucusFilter(
                            caucusFilter === "republican" ? null : "republican"
                          );
                        }
                      }}
                    >
                      <div className={styles.statHeader}>
                        <span className={styles.statParty}>
                          {legislativeView === "senate"
                            ? "Republican Caucus"
                            : "Republican"}
                        </span>
                        <FaRepublican size={24} color="#DC143C" />
                      </div>
                      <div
                        className={styles.statNumber}
                        style={{ color: "#DC143C" }}
                      >
                        {currentBreakdown?.republicans || 0}
                      </div>
                    </div>

                    <div
                      className={`${styles.statCard} ${
                        legislativeView === "senate" ? styles.clickable : ""
                      } ${
                        caucusFilter === "democratic" ? styles.activeFilter : ""
                      }`}
                      style={{ borderTopColor: "#1E90FF" }}
                      onClick={() => {
                        if (legislativeView === "senate") {
                          setCaucusFilter(
                            caucusFilter === "democratic" ? null : "democratic"
                          );
                        }
                      }}
                    >
                      <div className={styles.statHeader}>
                        <span className={styles.statParty}>
                          {legislativeView === "senate"
                            ? "Democratic Caucus"
                            : "Democrat"}
                        </span>
                        <FaDemocrat size={24} color="#1E90FF" />
                      </div>
                      <div
                        className={styles.statNumber}
                        style={{ color: "#1E90FF" }}
                      >
                        {legislativeView === "senate"
                          ? currentBreakdown?.democraticCaucus || 0
                          : currentBreakdown?.democrats || 0}
                      </div>
                      {legislativeView === "senate" && (
                        <div className={styles.caucusNote}>
                          {currentBreakdown?.democrats || 0} Dems +{" "}
                          {currentBreakdown?.independents || 0} Ind
                        </div>
                      )}
                    </div>

                    {legislativeView === "house" && (
                      <div
                        className={styles.statCard}
                        style={{ borderTopColor: "#9370DB" }}
                      >
                        <div className={styles.statHeader}>
                          <span className={styles.statParty}>Independent</span>
                          <FaFlagUsa size={24} color="#9370DB" />
                        </div>
                        <div
                          className={styles.statNumber}
                          style={{ color: "#9370DB" }}
                        >
                          {currentBreakdown?.independents || 0}
                        </div>
                      </div>
                    )}

                    {legislativeView === "house" &&
                      (currentBreakdown?.vacant || 0) > 0 && (
                        <div
                          className={styles.statCard}
                          style={{ borderTopColor: "#778da9" }}
                        >
                          <div className={styles.statHeader}>
                            <span className={styles.statParty}>Vacant</span>
                          </div>
                          <div
                            className={styles.statNumber}
                            style={{ color: "#778da9" }}
                          >
                            {currentBreakdown?.vacant || 0}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className={styles.legend}>
                    <h4>Map Legend</h4>
                    {legislativeView === "senate" ? (
                      <>
                        <div className={styles.legendItem}>
                          <span
                            className={styles.legendColor}
                            style={{ background: "#DC143C" }}
                          ></span>
                          <span>Republican Caucus</span>
                        </div>
                        <div className={styles.legendItem}>
                          <span
                            className={styles.legendColor}
                            style={{ background: "#1E90FF" }}
                          ></span>
                          <span>Democratic Caucus</span>
                        </div>
                        <div className={styles.legendItem}>
                          <span
                            className={styles.legendColor}
                            style={{
                              background:
                                "repeating-linear-gradient(90deg, #DC143C 0px, #DC143C 4px, #1E90FF 4px, #1E90FF 8px)",
                            }}
                          ></span>
                          <span>Split Delegation</span>
                        </div>
                        {caucusFilter && (
                          <div className={styles.legendItem}>
                            <span
                              className={styles.legendColor}
                              style={{ background: "#E8E8E8" }}
                            ></span>
                            <span>Filtered Out</span>
                          </div>
                        )}
                        <div className={styles.legendNote}>
                          Click caucus cards to filter map
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.legendItem}>
                          <span
                            className={styles.legendColor}
                            style={{ background: "#DC143C" }}
                          ></span>
                          <span>More Republican Reps than Democrats</span>
                        </div>
                        <div className={styles.legendItem}>
                          <span
                            className={styles.legendColor}
                            style={{ background: "#1E90FF" }}
                          ></span>
                          <span>More Democrat Reps than Republicans</span>
                        </div>
                        <div className={styles.legendItem}>
                          <span
                            className={styles.legendColor}
                            style={{
                              background:
                                "repeating-linear-gradient(90deg, #DC143C 0px, #DC143C 4px, #1E90FF 4px, #1E90FF 8px)",
                            }}
                          ></span>
                          <span>
                            Equal Number of Republican and Democratic Reps
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {showTooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
        >
          {tooltipContent.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

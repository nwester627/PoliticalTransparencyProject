"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { getControlColor } from "@/services/congressApi";
import { FIPS_TO_STATE_CODE, STATE_NAME_TO_CODE } from "@/utils/stateData";
import { GiCapitol } from "react-icons/gi";
import { MdAccountBalance } from "react-icons/md";
import { FaRepublican, FaDemocrat, FaFlagUsa } from "react-icons/fa";
import styles from "./LegislativeMap.module.css";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function LegislativeMap({
  senateComposition,
  senateBreakdown,
  houseBreakdown,
  legislativeView,
  onLegislativeViewChange,
}) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [caucusFilter, setCaucusFilter] = useState(null); // 'republican', 'democratic', or null

  // Get current breakdown based on legislative view
  const currentBreakdown =
    legislativeView === "house" ? houseBreakdown : senateBreakdown;

  const handleMouseEnter = useCallback(
    (geo, event) => {
      const { name, id } = geo.properties;

      // Convert state name or ID to state code
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
    [senateComposition, caucusFilter]
  );

  const handleMouseMove = useCallback((event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const getStateCodeFromId = (id) => {
    return FIPS_TO_STATE_CODE[id];
  };

  const getStateCodeFromName = (name) => {
    return STATE_NAME_TO_CODE[name];
  };

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
    [senateComposition, caucusFilter, legislativeView, getCaucusControl]
  );

  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.5, 1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

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
          }}
        >
          <MdAccountBalance size={20} />
          <span>House</span>
        </button>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.mapSection}>
          <div className={styles.mapContainer}>
            <ComposableMap
              projection="geoAlbersUsa"
              projectionConfig={{
                scale: 850,
              }}
              width={800}
              height={500}
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
              <ZoomableGroup zoom={zoom}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={(event) => handleMouseEnter(geo, event)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{
                          default: {
                            fill: getFillColor(geo),
                            stroke: "#415A77",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                          hover: {
                            fill: getFillColor(geo),
                            stroke: "#1B263B",
                            strokeWidth: 1.5,
                            outline: "none",
                            opacity: 0.9,
                          },
                          pressed: {
                            fill: getFillColor(geo),
                            stroke: "#1B263B",
                            strokeWidth: 1.5,
                            outline: "none",
                          },
                        }}
                      />
                    ))
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>

          <div className={styles.zoomControls}>
            <button onClick={handleZoomIn} className={styles.zoomButton}>
              +
            </button>
            <button onClick={handleResetZoom} className={styles.zoomButton}>
              Reset
            </button>
            <button onClick={handleZoomOut} className={styles.zoomButton}>
              −
            </button>
          </div>
        </div>

        <div className={styles.breakdownPanel}>
          <div className={styles.panelHeader}>
            <h3>
              {legislativeView === "senate"
                ? "Senate Composition"
                : "House Composition"}
            </h3>
            <div className={styles.totalSeats}>
              {legislativeView === "senate" ? "100" : "435"} Total Seats
            </div>
          </div>

          <div className={styles.breakdownStats}>
            <div
              className={`${styles.statCard} ${
                legislativeView === "senate" ? styles.clickable : ""
              } ${caucusFilter === "republican" ? styles.activeFilter : ""}`}
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
              <div className={styles.statNumber} style={{ color: "#DC143C" }}>
                {currentBreakdown?.republicans || 0}
              </div>
            </div>

            <div
              className={`${styles.statCard} ${
                legislativeView === "senate" ? styles.clickable : ""
              } ${caucusFilter === "democratic" ? styles.activeFilter : ""}`}
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
              <div className={styles.statNumber} style={{ color: "#1E90FF" }}>
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
                <div className={styles.statNumber} style={{ color: "#9370DB" }}>
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
                  <span>Both Republican</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendColor}
                    style={{ background: "#1E90FF" }}
                  ></span>
                  <span>Both Democrat</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendColor}
                    style={{ background: "#9370DB" }}
                  ></span>
                  <span>Split Delegation</span>
                </div>
              </>
            )}
          </div>
        </div>
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

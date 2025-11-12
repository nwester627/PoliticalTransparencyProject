"use client";

import { useState } from "react";
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

  // Get current breakdown based on legislative view
  const currentBreakdown =
    legislativeView === "house" ? houseBreakdown : senateBreakdown;

  const handleMouseEnter = (geo, event) => {
    const { name, id } = geo.properties;

    // Convert state name or ID to state code
    const stateCode = getStateCodeFromId(id) || getStateCodeFromName(name);
    const senateData = senateComposition[stateCode];

    if (senateData && senateData.senators && senateData.senators.length >= 2) {
      const senator1 = senateData.senators[0];
      const senator2 = senateData.senators[1];

      setTooltipContent(
        `${senateData.name}\n${senator1.name} (${senator1.party.charAt(0)})\n${
          senator2.name
        } (${senator2.party.charAt(0)})`
      );
      setTooltipPosition({ x: event.clientX, y: event.clientY });
      setShowTooltip(true);
    } else if (
      senateData &&
      senateData.senators &&
      senateData.senators.length === 1
    ) {
      const senator1 = senateData.senators[0];
      setTooltipContent(
        `${senateData.name}\n${senator1.name} (${senator1.party.charAt(
          0
        )})\n(One vacancy)`
      );
      setTooltipPosition({ x: event.clientX, y: event.clientY });
      setShowTooltip(true);
    }
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const getStateCodeFromId = (id) => {
    return FIPS_TO_STATE_CODE[id];
  };

  const getStateCodeFromName = (name) => {
    return STATE_NAME_TO_CODE[name];
  };

  const getFillColor = (geo) => {
    const { name, id } = geo.properties;
    const stateCode = getStateCodeFromId(id) || getStateCodeFromName(name);
    const senateData = senateComposition[stateCode];

    return senateData ? getControlColor(senateData.control) : "#E0E1DD";
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div className={styles.legislativeView}>
      <div className={styles.legislativeSubNav}>
        <button
          className={`${styles.subNavButton} ${
            legislativeView === "senate" ? styles.active : ""
          }`}
          onClick={() => onLegislativeViewChange("senate")}
        >
          <GiCapitol size={20} />
          <span>Senate</span>
        </button>
        <button
          className={`${styles.subNavButton} ${
            legislativeView === "house" ? styles.active : ""
          }`}
          onClick={() => onLegislativeViewChange("house")}
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
          <h3>
            {legislativeView === "senate"
              ? "Senate Breakdown"
              : "House Breakdown"}
          </h3>

          <div className={styles.breakdownStats}>
            <div className={styles.statItem}>
              <div className={styles.statNumber} style={{ color: "#DC143C" }}>
                {currentBreakdown?.republicans || 0}
              </div>
              <div className={styles.statLabel}>Republicans</div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statNumber} style={{ color: "#1E90FF" }}>
                {currentBreakdown?.democrats || 0}
              </div>
              <div className={styles.statLabel}>Democrats</div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statNumber} style={{ color: "#9370DB" }}>
                {currentBreakdown?.independents || 0}
              </div>
              <div className={styles.statLabel}>Independents</div>
            </div>

            {legislativeView === "house" && (
              <div className={styles.statItem}>
                <div className={styles.statNumber} style={{ color: "#E0E1DD" }}>
                  {currentBreakdown?.vacant || 0}
                </div>
                <div className={styles.statLabel}>Vacant</div>
              </div>
            )}
          </div>

          <div className={styles.legend}>
            <h4>State Control</h4>
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

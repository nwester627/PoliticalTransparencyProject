"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/numberFormat";

type Industry = { name?: string; amount?: number | string };

interface Props {
  industries: Industry[];
  totalRaised?: number;
}

const COLORS = [
  "#6366F1",
  "#06B6D4",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#8B5CF6",
  "#F97316",
];

export default function IndustryDonut({ industries, totalRaised = 0 }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  const data = useMemo(() => {
    const items = (industries || []).slice(0, 6).map((i) => ({
      name: i?.name || "Unknown",
      amount: Number(i?.amount) || 0,
    }));
    items.sort((a, b) => b.amount - a.amount);
    return items;
  }, [industries]);

  const pieData = useMemo(
    () => data.map((d) => ({ name: d.name, value: d.amount })),
    [data]
  );

  const total = useMemo(
    () => totalRaised || pieData.reduce((s, p) => s + Number(p.value || 0), 0),
    [totalRaised, pieData]
  );

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);

  const active = pieData[activeIndex ?? 0];

  // shared formatter: compact currency (e.g. $1.5M)
  const fc = (n: number) =>
    formatCurrency(Number(n) || 0, { compact: true, digits: 2 });

  useEffect(() => {
    const id = "donationsviz-focus-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      /* Remove default focus rings on mouse/tap, but keep visible outline for keyboard users */
      .donations-chart *:focus { outline: none !important; }
      .donations-chart *:focus-visible { outline: 3px solid rgba(37,99,235,0.45) !important; outline-offset: 3px; }
      .donations-chart { -webkit-tap-highlight-color: transparent; }
      .donations-chart svg { touch-action: manipulation; }
      .donations-chart .legend-item { -webkit-user-select: none; user-select: none; }
      .donations-chart .legend-item[role="button"] { cursor: pointer; }
      .donations-chart .legend-item:focus-visible { outline: 3px solid rgba(15,23,42,0.08); border-radius: 6px; }
      .donations-chart .sr-only { position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px); white-space: nowrap; border: 0; padding: 0; margin: -1px; }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  const chartTitleId = `industry-donut-title`;
  const chartDescId = `industry-donut-desc`;

  return (
    <div
      className="industry-donut donations-chart"
      role="img"
      aria-labelledby={chartTitleId}
      aria-describedby={chartDescId}
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
            Top Industries
          </h3>
          <div style={{ fontSize: 12, color: "#475569" }}>
            By contribution amount
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Total raised</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{fc(total)}</div>
        </div>
      </div>

      <div id={chartDescId} className="sr-only">
        Total raised {fc(total)} across top industries.
      </div>

      <div
        style={{ position: "relative", width: "100%", flex: 1, minHeight: 220 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={"55%"}
              outerRadius={"80%"}
              paddingAngle={3}
              onMouseEnter={(d: any, index: number) => {
                if (!isAnimating) onPieEnter(d, index);
              }}
              onMouseLeave={() => {
                if (!isAnimating) setActiveIndex(null);
              }}
              isAnimationActive={true}
              animationDuration={800}
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationEnd={() => setIsAnimating(false)}
              cx="50%"
              cy="48%"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={1}
                  fillOpacity={
                    selectedIndex === null || selectedIndex === index ? 1 : 0.25
                  }
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `${formatCurrency(Number(value) || 0, {
                  compact: true,
                  digits: 2,
                })}`
              }
            />
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            textAlign: "center",
            width: 160,
          }}
        >
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Top</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "#0f172a",
              marginTop: 4,
            }}
          >
            {active ? active.name : "Industries"}
          </div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
            {active ? fc(Number(active.value)) : fc(total)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {pieData.map((d, i) => {
          const isSelected = selectedIndex === i;
          const percent = total
            ? Math.round((Number(d.value) / total) * 100)
            : 0;
          return (
            <motion.div
              key={d.name}
              className="legend-item"
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: i * 0.06,
                duration: 0.35,
                type: "spring",
                stiffness: 160,
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 160,
                opacity: selectedIndex === null || isSelected ? 1 : 0.45,
              }}
              onClick={() => setSelectedIndex(isSelected ? null : i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedIndex(isSelected ? null : i);
                }
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: COLORS[i % COLORS.length],
                  borderRadius: 3,
                }}
                aria-hidden
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}
                >
                  {d.name}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {fc(Number(d.value))} • {percent}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

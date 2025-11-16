"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { backendBase } from "@/utils/electionAPI";

export default function ResultsPage() {
  const params = useParams();
  const rawState = Array.isArray(params?.state)
    ? params.state[0]
    : params?.state || "";
  const state = (rawState || "").toUpperCase();
  const rawYear = Array.isArray(params?.year) ? params.year[0] : params?.year;
  const year = rawYear;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!state || !year) return;
    setLoading(true);
    setError(null);
    fetch(`${backendBase}/api/results/${state}/${year}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [state, year]);

  if (!state || !year) return <div>Missing state or year</div>;
  if (loading) return <div>Loading results...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!data) return <div>No results data available</div>;

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 12 }}>
        ← Back
      </Link>
      <h1 style={{ marginBottom: 6 }}>
        {state} {year} — {data.office || data.race || "Statewide"}
      </h1>
      <div style={{ color: "#666", marginBottom: 12 }}>
        Reporting: {data.reporting || data.reporting || "N/A"} · Last updated:{" "}
        {data.last_updated || "N/A"}
      </div>

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 12 }}>Candidate</th>
              <th style={{ textAlign: "left", padding: 12 }}>Party</th>
              <th style={{ textAlign: "right", padding: 12 }}>Votes</th>
              <th style={{ textAlign: "right", padding: 12 }}>%</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((r: any, idx: number) => (
              <tr key={idx} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: 12 }}>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      r.candidate + " " + state + " " + year
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {r.candidate}
                  </a>
                </td>
                <td style={{ padding: 12 }}>{r.party}</td>
                <td style={{ padding: 12, textAlign: "right" }}>
                  {r.votes.toLocaleString()}
                </td>
                <td style={{ padding: 12, textAlign: "right" }}>{r.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, color: "#666" }}>
        Source: {data.results_source || "OpenElections"} —{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          open source data
        </a>
      </div>
    </div>
  );
}

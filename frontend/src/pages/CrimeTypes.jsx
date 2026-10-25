import { useState, useMemo } from "react";
import TickBar from "../components/TickBar";

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : "—";
}

const VIOLENT_SET = new Set([
  "HOMICIDE",
  "BATTERY",
  "ASSAULT",
  "ROBBERY",
  "CRIM SEXUAL ASSAULT",
  "SEX OFFENSE",
  "WEAPONS VIOLATION",
  "OFFENSE INVOLVING CHILDREN",
  "KIDNAPPING",
  "INTIMIDATION"
]);

export default function CrimeTypes({
  selectedArea,
  areaRank,
  areaCount,
  loadingBreakdown,
  breakdown = [],
  breakdownTotal = 0,
  days = 30,
  momentum,
  violentCount = 0,
  propertyCount = 0,
  violentPercent = 55,
  propertyPercent = 45,
  setPage,
}) {
  const [filterMode, setFilterMode] = useState("ALL"); // 'ALL' | 'VIOLENT' | 'PROPERTY'

  const filteredBreakdown = useMemo(() => {
    if (filterMode === "ALL") return breakdown;
    if (filterMode === "VIOLENT") {
      return breakdown.filter((item) =>
        VIOLENT_SET.has(item.primary_type?.toUpperCase())
      );
    }
    return breakdown.filter(
      (item) => !VIOLENT_SET.has(item.primary_type?.toUpperCase())
    );
  }, [breakdown, filterMode]);

  const topCategory = breakdown[0];
  const topPct = breakdownTotal && topCategory
    ? Math.round((topCategory.type_count / breakdownTotal) * 100)
    : 0;

  return (
    <div className="cw-page-wrap">
      {/* HEADER SECTION */}
      <div className="cw-full-card-head cw-hotspot-header">
        <div>
          <div className="ov-eyebrow">
            <span className="ov-status-dot" />
            Offense Taxonomy · Crime Composition
            <span className="ov-index">02 / TAXONOMY</span>
          </div>
          <h2 className="cw-page-title">
            Crime Type Breakdown — {selectedArea || "Chicago"}
          </h2>
          <p className="cw-page-subtitle">
            Taxonomic classification and violent vs. property crime ratio for {selectedArea || "this sector"} over the last {days} days.
          </p>
        </div>

        <div className="cw-header-metrics">
          {momentum && (
            <div className="cw-stat-chip">
              <span className="cw-stat-chip-label">Trend Momentum</span>
              <strong
                className="cw-stat-chip-val"
                style={{ color: momentum.isUp ? "#E2574C" : "#22C55E" }}
              >
                {momentum.delta}
              </strong>
            </div>
          )}
          <div className="cw-stat-chip">
            <span className="cw-stat-chip-label">Citywide Rank</span>
            <strong className="cw-stat-chip-val" style={{ color: "#E2574C" }}>
              {areaRank ? `#${areaRank}` : "—"}
            </strong>
          </div>
          <div className="cw-stat-chip">
            <span className="cw-stat-chip-label">{days}-Day Incidents</span>
            <strong className="cw-stat-chip-val">{formatNumber(areaCount || breakdownTotal)}</strong>
          </div>
        </div>
      </div>

      {/* VIOLENT VS PROPERTY TAXONOMY SPLIT CARD */}
      {!loadingBreakdown && breakdown.length > 0 && (
        <div className="cw-metric-cards-row">
          {/* VIOLENT CRIMES RATIO */}
          <div className="cw-metric-card" style={{ borderLeft: "3px solid #E2574C" }}>
            <div className="ov-eyebrow" style={{ color: "#E2574C" }}>VIOLENT CRIMES INDEX</div>
            <div className="cw-metric-val" style={{ color: "#E2574C" }}>
              {violentPercent}% <span style={{ fontSize: "14px", color: "#85868F" }}>of offenses</span>
            </div>
            <div className="ov-track" style={{ margin: "8px 0" }}>
              <div
                className="ov-track-fill ov-fill-primary"
                style={{ width: `${violentPercent}%` }}
              />
            </div>
            <div className="cw-metric-sub">
              Battery, Assault, Robbery &amp; Weapons · <strong>{formatNumber(violentCount)}</strong> cases
            </div>
          </div>

          {/* PROPERTY & PUBLIC ORDER */}
          <div className="cw-metric-card" style={{ borderLeft: "3px solid #60A5FA" }}>
            <div className="ov-eyebrow" style={{ color: "#60A5FA" }}>PROPERTY &amp; ORDER</div>
            <div className="cw-metric-val" style={{ color: "#60A5FA" }}>
              {propertyPercent}% <span style={{ fontSize: "14px", color: "#85868F" }}>of offenses</span>
            </div>
            <div className="ov-track" style={{ margin: "8px 0" }}>
              <div
                className="ov-track-fill"
                style={{ width: `${propertyPercent}%`, background: "#60A5FA" }}
              />
            </div>
            <div className="cw-metric-sub">
              Theft, Burglary &amp; Vandalism · <strong>{formatNumber(propertyCount)}</strong> cases
            </div>
          </div>

          {/* LEADING DRIVER */}
          <div className="cw-metric-card">
            <div className="ov-eyebrow">PRIMARY INCIDENT DRIVER</div>
            <div className="cw-metric-val">{topCategory?.primary_type || "—"}</div>
            <div className="cw-metric-sub" style={{ marginTop: "12px" }}>
              Accounts for <strong>{topPct}%</strong> of all recorded offenses in {selectedArea}.
            </div>
          </div>
        </div>
      )}

      {/* FILTER TABS & ALL CATEGORIES */}
      <div className="cw-full-card">
        <div className="cw-full-card-head" style={{ marginBottom: "16px" }}>
          <div>
            <div className="cw-full-card-title">Offense Classifications</div>
            <div className="cw-full-card-sub">
              Showing {filteredBreakdown.length} of {breakdown.length} tracked categories in {selectedArea}
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div className="cw-map-toggle-group">
            <button
              type="button"
              className={"cw-map-toggle-btn" + (filterMode === "ALL" ? " cw-toggle-active" : "")}
              onClick={() => setFilterMode("ALL")}
            >
              All Categories ({breakdown.length})
            </button>
            <button
              type="button"
              className={"cw-map-toggle-btn" + (filterMode === "VIOLENT" ? " cw-toggle-active" : "")}
              onClick={() => setFilterMode("VIOLENT")}
            >
              Violent Only
            </button>
            <button
              type="button"
              className={"cw-map-toggle-btn" + (filterMode === "PROPERTY" ? " cw-toggle-active" : "")}
              onClick={() => setFilterMode("PROPERTY")}
            >
              Property &amp; Order
            </button>
          </div>
        </div>

        {loadingBreakdown && (
          <div className="ov-empty">Compiling classification breakdown…</div>
        )}

        {!loadingBreakdown && filteredBreakdown.length === 0 && (
          <div className="ov-news-unavailable">
            <div className="ov-news-symbol">!</div>
            <div>
              <strong>No categories in this filter</strong>
              <p>No offenses match the "{filterMode}" filter for {selectedArea}.</p>
            </div>
          </div>
        )}

        {!loadingBreakdown && filteredBreakdown.length > 0 && (
          <div className="cw-types-grid">
            {filteredBreakdown.map((t, index) => {
              const count = Number(t.type_count) || 0;
              const pct = breakdownTotal ? (count / breakdownTotal) * 100 : 0;
              const roundedPct = Math.round(pct);
              const isViolent = VIOLENT_SET.has(t.primary_type?.toUpperCase());

              return (
                <div className="cw-type-item-card" key={t.primary_type}>
                  <div className="cw-type-item-top">
                    <div className="cw-type-title-row">
                      <span className="cw-type-item-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="cw-type-item-name">{t.primary_type}</span>
                      <span
                        className="cw-search-badge"
                        style={{
                          background: isViolent ? "rgba(226,87,76,0.15)" : "rgba(96,165,250,0.15)",
                          border: `1px solid ${isViolent ? "#E2574C" : "#60A5FA"}`,
                          color: isViolent ? "#E2574C" : "#60A5FA",
                          padding: "2px 6px",
                          fontSize: "8px",
                        }}
                      >
                        {isViolent ? "VIOLENT" : "PROPERTY"}
                      </span>
                    </div>
                    <span className="cw-type-item-pct">{roundedPct}%</span>
                  </div>

                  <div className="cw-type-item-stats">
                    <span>Recorded cases</span>
                    <strong>{formatNumber(count)}</strong>
                  </div>

                  <TickBar percent={pct} />
                </div>
              );
            })}
          </div>
        )}

        <div className="ov-footnote" style={{ marginTop: "24px" }}>
          <span>Percentages reflect share of total activity in {selectedArea} over the {days}-day reporting horizon.</span>
          {setPage && (
            <button
              type="button"
              className="ov-refresh"
              onClick={() => setPage("time")}
            >
              Examine Diurnal Patterns →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

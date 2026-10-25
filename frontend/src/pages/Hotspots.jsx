function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : "—";
}

export default function Hotspots({
  hotspots = [],
  loadingHotspots,
  selectedArea,
  setSelectedArea,
  maxCount = 1,
  days = 30,
  momentum,
  onOpenCompare,
  setPage,
}) {
  const totalCases = hotspots.reduce((sum, h) => sum + (Number(h.crime_count) || 0), 0);
  const leader = hotspots[0];
  const selectedIndex = hotspots.findIndex((h) => h.area_name === selectedArea);
  const selectedHotspot = hotspots[selectedIndex] || leader;
  const selectedRank = selectedIndex >= 0 ? selectedIndex + 1 : 1;

  const selectedPct = maxCount && selectedHotspot
    ? Math.round(((selectedHotspot.crime_count || 0) / maxCount) * 100)
    : 0;

  return (
    <div className="cw-page-wrap">
      {/* HEADER SECTION */}
      <div className="cw-full-card-head cw-hotspot-header">
        <div>
          <div className="ov-eyebrow">
            <span className="ov-status-dot" />
            Geographic Surveillance · City Rankings
            <span className="ov-index">01 / 10 AREAS</span>
          </div>
          <h2 className="cw-page-title">Chicago Hotspot Index</h2>
          <p className="cw-page-subtitle">
            Ranked community areas with the highest reported incident volume over the last {days} days.
          </p>
        </div>

        <div className="cw-header-metrics">
          {onOpenCompare && (
            <button
              type="button"
              className="cw-btn cw-btn-secondary"
              onClick={onOpenCompare}
              style={{ padding: "9px 15px", display: "flex", gap: "8px", alignItems: "center" }}
            >
              <span>⚖</span> Compare Sectors
            </button>
          )}
          <div className="cw-stat-chip">
            <span className="cw-stat-chip-label">Combined ({days}d)</span>
            <strong className="cw-stat-chip-val">{formatNumber(totalCases)}</strong>
          </div>
          <div className="cw-stat-chip">
            <span className="cw-stat-chip-label">City Peak Area</span>
            <strong className="cw-stat-chip-val" style={{ color: "#E2574C" }}>
              {leader ? leader.area_name : "—"}
            </strong>
          </div>
        </div>
      </div>

      {loadingHotspots ? (
        <div className="cw-full-card">
          <div className="ov-empty">Retrieving hotspot telemetry from city database…</div>
        </div>
      ) : (
        <div className="cw-hotspots-layout">
          {/* LEFT: RANKED LIST */}
          <div className="cw-hotspots-list-card">
            <div className="cw-list-head">
              <span>RANK &amp; COMMUNITY AREA</span>
              <span>30-DAY TOTAL / SHARE</span>
            </div>

            <div className="cw-hotspot-rows">
              {hotspots.map((h, i) => {
                const count = Number(h.crime_count) || 0;
                const pct = maxCount ? Math.round((count / maxCount) * 100) : 0;
                const isSelected = selectedArea === h.area_name;

                return (
                  <div
                    key={h.area_number ?? h.area_name}
                    className={"cw-hotspot-row" + (isSelected ? " cw-row-active" : "")}
                    onClick={() => setSelectedArea(h.area_name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedArea(h.area_name);
                    }}
                  >
                    <div className="cw-hotspot-rank">
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className="cw-hotspot-info">
                      <div className="cw-hotspot-name-row">
                        <span className="cw-hotspot-name">{h.area_name}</span>
                        {isSelected && <span className="cw-active-badge">SELECTED</span>}
                      </div>

                      <div className="cw-hotspot-bar-track">
                        <div
                          className={"cw-hotspot-bar-fill" + (i === 0 ? " cw-bar-leader" : "")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="cw-hotspot-metrics">
                      <span className="cw-hotspot-count">{formatNumber(count)}</span>
                      <span className="cw-hotspot-pct">{pct}% of peak</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SELECTED AREA INTELLIGENCE DOSSIER */}
          {selectedHotspot && (
            <div className="cw-hotspot-dossier-card">
              <div className="ov-eyebrow">
                <span className="ov-status-dot" />
                Active Focus · Area Dossier
              </div>

              <div className="cw-dossier-header">
                <div>
                  <div className="ov-muted">Selected Community Area</div>
                  <h3 className="cw-dossier-name">{selectedHotspot.area_name}</h3>
                </div>
                <div className="ov-rank">
                  <span className="ov-muted">City Rank</span>
                  <strong style={{ fontSize: "28px" }}>#{selectedRank}</strong>
                </div>
              </div>

              <div className="cw-dossier-stat-block">
                <div>
                  <div className="ov-muted">30-Day Reported Cases</div>
                  <div className="ov-big-number" style={{ fontSize: "44px", margin: "4px 0" }}>
                    {formatNumber(selectedHotspot.crime_count)}
                  </div>
                  <div className="ov-muted" style={{ textTransform: "none", fontSize: "11px" }}>
                    Accounting for {selectedPct}% of Chicago's highest single-area load.
                  </div>
                </div>

                <div className="ov-peak" style={{ marginTop: "16px" }}>
                  <div className="cw-dossier-bar-label">
                    <span>Proportion of city peak</span>
                    <strong>{selectedPct}%</strong>
                  </div>
                  <div className="ov-track">
                    <div
                      className="ov-track-fill ov-fill-primary"
                      style={{ width: `${selectedPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="cw-dossier-actions">
                <div className="ov-muted" style={{ marginBottom: "10px" }}>
                  Investigate Further
                </div>

                <div className="cw-dossier-buttons">
                  {setPage && (
                    <>
                      <button
                        type="button"
                        className="cw-btn cw-btn-primary"
                        onClick={() => setPage("overview")}
                      >
                        Deep Dive Overview →
                      </button>
                      <button
                        type="button"
                        className="cw-btn cw-btn-secondary"
                        onClick={() => setPage("types")}
                      >
                        Crime Types Breakdown →
                      </button>
                      <button
                        type="button"
                        className="cw-btn cw-btn-secondary"
                        onClick={() => setPage("time")}
                      >
                        Hourly &amp; Daily Spikes →
                      </button>
                      <button
                        type="button"
                        className="cw-btn cw-btn-secondary"
                        onClick={() => setPage("map")}
                      >
                        Geographic Incidents Map →
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

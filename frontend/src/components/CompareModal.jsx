import { useState, useMemo } from "react";

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : "—";
}

export default function CompareModal({
  isOpen,
  onClose,
  hotspots = [],
  initialAreaA,
  setSelectedArea,
  setPage,
}) {
  const [areaAName, setAreaAName] = useState(initialAreaA || hotspots[0]?.area_name || "");
  const [areaBName, setAreaBName] = useState(hotspots[1]?.area_name || "");

  const areaA = useMemo(
    () => hotspots.find((h) => h.area_name === areaAName) || hotspots[0],
    [hotspots, areaAName]
  );
  const areaB = useMemo(
    () => hotspots.find((h) => h.area_name === areaBName) || hotspots[1],
    [hotspots, areaBName]
  );

  const rankA = hotspots.findIndex((h) => h.area_name === areaAName) + 1;
  const rankB = hotspots.findIndex((h) => h.area_name === areaBName) + 1;

  const countA = Number(areaA?.crime_count) || 0;
  const countB = Number(areaB?.crime_count) || 0;
  const maxVolume = Math.max(countA, countB, 1);

  if (!isOpen) return null;

  return (
    <div className="cw-search-overlay" onClick={onClose}>
      <div
        className="cw-search-modal cw-compare-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="cw-compare-head">
          <div>
            <div className="ov-eyebrow">
              <span className="ov-status-dot" />
              Comparative Telemetry · Area vs Area
            </div>
            <h3 className="cw-page-title" style={{ fontSize: "22px", margin: "6px 0 0" }}>
              Head-to-Head Sector Comparison
            </h3>
          </div>
          <button type="button" className="cw-search-clear" onClick={onClose}>✕</button>
        </div>

        {/* SELECTORS ROW */}
        <div className="cw-compare-selectors">
          <div className="cw-compare-select-col">
            <label className="ov-muted">Sector A</label>
            <select
              className="cw-compare-select"
              value={areaAName}
              onChange={(e) => setAreaAName(e.target.value)}
            >
              {hotspots.map((h) => (
                <option key={h.area_number ?? h.area_name} value={h.area_name}>
                  #{hotspots.indexOf(h) + 1} {h.area_name} ({formatNumber(h.crime_count)} cases)
                </option>
              ))}
            </select>
          </div>

          <div className="cw-compare-vs-badge">VS</div>

          <div className="cw-compare-select-col">
            <label className="ov-muted">Sector B</label>
            <select
              className="cw-compare-select"
              value={areaBName}
              onChange={(e) => setAreaBName(e.target.value)}
            >
              {hotspots.map((h) => (
                <option key={h.area_number ?? h.area_name} value={h.area_name}>
                  #{hotspots.indexOf(h) + 1} {h.area_name} ({formatNumber(h.crime_count)} cases)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* COMPARISON METRICS GRID */}
        <div className="cw-compare-grid">
          {/* COLUMN A */}
          <div className="cw-compare-col-card">
            <div className="ov-eyebrow" style={{ color: "#E2574C" }}>SECTOR A</div>
            <h4 className="cw-compare-area-name">{areaA?.area_name}</h4>
            <div className="cw-compare-rank-badge">City Rank #{rankA}</div>

            <div className="cw-compare-stat">
              <span className="ov-muted">Incident Volume</span>
              <div className="cw-compare-num">{formatNumber(countA)}</div>
              <div className="ov-track">
                <div
                  className="ov-track-fill ov-fill-primary"
                  style={{ width: `${(countA / maxVolume) * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              className="cw-btn cw-btn-primary"
              style={{ marginTop: "16px", width: "100%" }}
              onClick={() => {
                setSelectedArea(areaA.area_name);
                setPage("overview");
                onClose();
              }}
            >
              Examine {areaA?.area_name} →
            </button>
          </div>

          {/* COLUMN B */}
          <div className="cw-compare-col-card">
            <div className="ov-eyebrow" style={{ color: "#60A5FA" }}>SECTOR B</div>
            <h4 className="cw-compare-area-name">{areaB?.area_name}</h4>
            <div className="cw-compare-rank-badge" style={{ borderColor: "#60A5FA", color: "#60A5FA" }}>
              City Rank #{rankB}
            </div>

            <div className="cw-compare-stat">
              <span className="ov-muted">Incident Volume</span>
              <div className="cw-compare-num">{formatNumber(countB)}</div>
              <div className="ov-track">
                <div
                  className="ov-track-fill"
                  style={{ width: `${(countB / maxVolume) * 100}%`, background: "#60A5FA" }}
                />
              </div>
            </div>

            <button
              type="button"
              className="cw-btn cw-btn-secondary"
              style={{ marginTop: "16px", width: "100%" }}
              onClick={() => {
                setSelectedArea(areaB.area_name);
                setPage("overview");
                onClose();
              }}
            >
              Examine {areaB?.area_name} →
            </button>
          </div>
        </div>

        {/* COMPARATIVE DELTA INSIGHT */}
        <div className="cw-compare-insight-banner">
          <span className="ch-alert-tag">DIFFERENTIAL ANALYSIS</span>
          <span>
            <strong>{countA >= countB ? areaA?.area_name : areaB?.area_name}</strong> records{" "}
            <strong>{formatNumber(Math.abs(countA - countB))}</strong> more incidents (
            {Math.round((Math.abs(countA - countB) / Math.max(Math.min(countA, countB), 1)) * 100)}% differential)
            than {countA >= countB ? areaB?.area_name : areaA?.area_name}.
          </span>
        </div>
      </div>
    </div>
  );
}

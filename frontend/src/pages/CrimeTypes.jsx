import TickBar from "../components/TickBar";

export default function CrimeTypes({ selectedArea, areaRank, areaCount, loadingBreakdown, breakdown, breakdownTotal }) {
  return (
          <div className="cw-page-wrap">
            <div className="cw-full-card">
              <div className="cw-full-card-head">
                <div className="cw-full-card-title">
                  Crime type breakdown — {selectedArea || "select an area"}
                </div>
                <div className="cw-full-card-sub">
                  {areaRank ? `Rank #${areaRank} · ${areaCount} incidents` : ""}
                </div>
              </div>
              {loadingBreakdown && (
                <div className="cw-state cw-state-dark">Loading breakdown…</div>
              )}
              {!loadingBreakdown && breakdown.length === 0 && (
                <div className="cw-news-empty">
                  No category data returned for this area. Pick a different
                  hotspot above, or check that the backend's breakdown
                  endpoint is reachable.
                </div>
              )}
              {!loadingBreakdown &&
                breakdown.map((t) => {
                  const pct = breakdownTotal
                    ? (t.type_count / breakdownTotal) * 100
                    : 0;
                  return (
                    <div className="cw-full-type-row" key={t.primary_type}>
                      <div className="cw-type-top">
                        <span className="cw-type-name">{t.primary_type}</span>
                        <span className="cw-type-pct">{Math.round(pct)}%</span>
                      </div>
                      <div className="cw-type-nums">
                        <span className="cw-type-count">{t.type_count}</span>
                        <span className="cw-type-count-unit">cases, 30 days</span>
                      </div>
                      <TickBar percent={pct} />
                    </div>
                  );
                })}
            </div>
          </div>
  );
}

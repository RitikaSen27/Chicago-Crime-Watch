

export default function Hotspots({ hotspots, loadingHotspots, selectedArea, setSelectedArea, maxCount }) {
  return (
          <div className="cw-page-wrap">
            <div className="cw-full-card">
              <div className="cw-full-card-head">
                <div className="cw-full-card-title">
                  All tracked hotspots — last 30 days
                </div>
                <div className="cw-full-card-sub">
                  {hotspots.length} community areas
                </div>
              </div>
              {loadingHotspots && (
                <div className="cw-state cw-state-dark">Loading hotspots…</div>
              )}
              {!loadingHotspots &&
                hotspots.map((h, i) => (
                  <div
                    className={
                      "cw-hotspot-row" +
                      (selectedArea === h.area_name ? " cw-row-active" : "")
                    }
                    key={h.area_number}
                    onClick={() => setSelectedArea(h.area_name)}
                  >
                    <div className="cw-hotspot-rank">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="cw-hotspot-name">{h.area_name}</div>
                      <div className="cw-hotspot-bar-track">
                        <div
                          className="cw-hotspot-bar-fill"
                          style={{ width: `${(h.crime_count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="cw-hotspot-count">{h.crime_count}</div>
                  </div>
                ))}
            </div>
          </div>
  );
}

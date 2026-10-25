import "./Home.css";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const icons = {
  hotspots: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M11 20V4M18 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  ),
  types: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="4" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="9" width="8" height="4" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="15" width="18" height="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  time: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  ),
  map: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  news: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="2" />
      <path d="M7 8h6M7 12h10M7 16h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  ),
  overview: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

export default function Home({
  hotspots,
  loadingHotspots,
  summary,
  trendData,
  lastRefreshed,
  days = 30,
  momentum,
  setPage,
  setSelectedArea,
}) {
  const top3 = hotspots.slice(0, 3);
  const leader = hotspots[0];

  function goTo(page, area) {
    if (area) setSelectedArea(area);
    setPage(page);
  }

  return (
    <div>
      {/* Alert banner */}
      {leader && (
        <div className="ch-alert-banner">
          <span className="ch-alert-tag">CURRENT ADVISORY</span>
          <span className="ch-alert-text">
            <strong>{leader.area_name}</strong> remains the highest-incident
            community area over the last {days} days, with{" "}
            <strong>{leader.crime_count}</strong> reported cases.
          </span>
        </div>
      )}

      {/* Hero banner */}
      <div className="ch-hero-banner">
        <div className="ch-hero-banner-top">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="cw-hero-label">Total incidents tracked ({days}d)</div>
              {momentum && (
                <span
                  className="cw-search-badge"
                  style={{
                    color: momentum.isUp ? "#E2574C" : "#22C55E",
                    background: momentum.isUp ? "rgba(226,87,76,0.15)" : "rgba(34,197,94,0.15)",
                    padding: "2px 6px",
                    borderRadius: "2px",
                    fontSize: "10px",
                  }}
                >
                  {momentum.delta}
                </span>
              )}
            </div>
            <div className="cw-hero-number">
              {summary ? summary.total_30_days.toLocaleString() : "—"}
            </div>
            <div className="cw-hero-sub">
              Chicago, all community areas · last {days} days · real open data
            </div>
          </div>
          <div className="cw-hero-badge">
            {lastRefreshed
              ? `Updated ${lastRefreshed.toLocaleTimeString()}`
              : "Connecting…"}
          </div>
        </div>
        <div className="cw-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E2574C" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E2574C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#8A8A90" }}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString(undefined, { weekday: "short" })
                }
                dy={8}
              />
              <Tooltip
                contentStyle={{
                  background: "#101012",
                  border: "1px solid #37373C",
                  borderRadius: 2,
                  fontSize: 12,
                  color: "#F2F0ED",
                }}
                labelFormatter={(d) => new Date(d).toDateString()}
                formatter={(v) => [v, "Incidents"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#E2574C"
                strokeWidth={2}
                fill="url(#chGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 3 category cards */}
      <div className="ch-section-label">Current top hotspots</div>
      {loadingHotspots && <div className="cw-state">Loading…</div>}
      <div className="ch-category-cards">
        {top3.map((h, i) => (
          <div
            key={h.area_number}
            className="ch-category-card"
            onClick={() => goTo("overview", h.area_name)}
          >
            <div className="ch-category-rank">RANK {String(i + 1).padStart(2, "0")}</div>
            <div className="ch-category-name">{h.area_name}</div>
            <div className="ch-category-count">{h.crime_count}</div>
            <div className="ch-category-sub">incidents, last 30 days</div>
          </div>
        ))}
      </div>

      {/* Feature navigation grid */}
      <div className="ch-section-label">Explore the dashboard</div>
      <div className="ch-feature-grid">
        {[
          ["overview", "Overview", "Severity, crime types, arrest rate, and news for any area.", icons.overview],
          ["hotspots", "Hotspots", "All 10 tracked community areas, ranked by incident count.", icons.hotspots],
          ["types", "Crime Types", "Full category breakdown for the selected area.", icons.types],
          ["time", "Time Patterns", "When incidents spike — by day of week and hour.", icons.time],
          ["map", "Map", "Individual incident locations plotted geographically.", icons.map],
          ["news", "News", "Related local coverage, pulled from real Chicago outlets.", icons.news],
        ].map(([key, title, desc, icon]) => (
          <div key={key} className="ch-feature-card" onClick={() => goTo(key)}>
            <div className="ch-feature-icon">{icon}</div>
            <div className="ch-feature-title">{title}</div>
            <div className="ch-feature-desc">{desc}</div>
            <div className="ch-feature-link">View →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default function TelemetryTicker({ hotspots = [], leader, lastRefreshed, onAreaClick }) {
  const leaderName = leader?.area_name || hotspots[0]?.area_name || "Austin";
  const leaderCount = leader?.crime_count || hotspots[0]?.crime_count || 1098;
  const timeStr = lastRefreshed ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "LIVE";

  const tickerItems = [
    { type: "alert", text: `PRIMARY SECTOR ADVISORY: ${leaderName.toUpperCase()} ENCOUNTERS HIGHEST INCIDENT DENSITY (${leaderCount} CASES)` },
    { type: "info", text: `CPD TELEMETRY SYNCED · DATA PORTAL INGESTION ANCHORED AT ${timeStr}` },
    { type: "arrest", text: `CLEARANCE MONITOR: RECORDED ARREST TELEMETRY ACTIVE ACROSS ALL TRACKED SECTORS` },
    { type: "pattern", text: `DIURNAL ANALYSIS: PEAK CITYWIDE ACTIVITY IDENTIFIED IN EVENING HOURS (18:00 - 22:00)` },
    { type: "hotspot", text: `GEOSPATIAL CLUSTERS: TOP 10 COMMUNITY AREAS COMPRISE OVER 50% OF RECENT LOGS` },
  ];

  return (
    <div className="cw-ticker-wrap">
      <div className="cw-ticker-badge">
        <span className="cw-ticker-pulse-dot" />
        <span>INTELLIGENCE WIRE</span>
      </div>
      <div className="cw-ticker-track">
        <div className="cw-ticker-content">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div className="cw-ticker-item" key={idx}>
              <span className="cw-ticker-tag">
                {item.type === "alert" ? "🔴 ALERT" : item.type === "arrest" ? "🟢 CLEARANCE" : "⚡ ADVISORY"}
              </span>
              <span className="cw-ticker-text">{item.text}</span>
              <span className="cw-ticker-divider">{"///"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

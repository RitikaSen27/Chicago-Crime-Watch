import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  YAxis,
} from "recharts";

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : "—";
}

export default function TimePatterns({
  selectedArea,
  loadingTimePattern,
  timePattern = { by_day: [], by_hour: [] },
  peakDay,
  peakHour,
  formatHour = (h) => `${h}:00`,
  setPage,
}) {
  const byDay = timePattern.by_day || [];
  const byHour = timePattern.by_hour || [];

  const totalIncidentsInPeriod = byDay.reduce((sum, d) => sum + (Number(d.count) || 0), 0);

  // Find lowest hour
  const lowestHour = byHour.length
    ? byHour.reduce((min, cur) => (cur.count < min.count ? cur : min))
    : null;

  return (
    <div className="cw-page-wrap">
      {/* HEADER SECTION */}
      <div className="cw-full-card-head cw-hotspot-header">
        <div>
          <div className="ov-eyebrow">
            <span className="ov-status-dot" />
            Temporal Surveillance · Time Patterns
            <span className="ov-index">03 / TEMPORAL</span>
          </div>
          <h2 className="cw-page-title">
            Time Patterns — {selectedArea || "Chicago"}
          </h2>
          <p className="cw-page-subtitle">
            Analyzing day-of-week distributions and 24-hour diurnal rhythms for {selectedArea || "the active area"}.
          </p>
        </div>

        <div className="cw-header-metrics">
          <div className="cw-stat-chip">
            <span className="cw-stat-chip-label">Analyzed Incidents</span>
            <strong className="cw-stat-chip-val">{formatNumber(totalIncidentsInPeriod)}</strong>
          </div>
          <div className="cw-stat-chip">
            <span className="cw-stat-chip-label">Peak Daily Window</span>
            <strong className="cw-stat-chip-val" style={{ color: "#E2574C" }}>
              {peakDay ? peakDay.day_name : "—"}
            </strong>
          </div>
        </div>
      </div>

      {loadingTimePattern ? (
        <div className="cw-full-card">
          <div className="ov-empty">Computing temporal histograms and spike indexes…</div>
        </div>
      ) : (
        <>
          {/* TOP 3 TEMPORAL METRIC CARDS */}
          <div className="cw-metric-cards-row">
            <div className="cw-metric-card">
              <div className="ov-muted">Peak Incident Day</div>
              <div className="cw-metric-val" style={{ color: "#E2574C" }}>
                {peakDay ? peakDay.day_name : "—"}
              </div>
              <div className="cw-metric-sub">
                <strong>{peakDay ? formatNumber(peakDay.count) : "—"}</strong> reported cases on {peakDay?.day_name}s
              </div>
            </div>

            <div className="cw-metric-card">
              <div className="ov-muted">Peak Hourly Spike</div>
              <div className="cw-metric-val" style={{ color: "#E2574C" }}>
                {peakHour ? formatHour(peakHour.hour) : "—"}
              </div>
              <div className="cw-metric-sub">
                <strong>{peakHour ? formatNumber(peakHour.count) : "—"}</strong> cases recorded around this hour
              </div>
            </div>

            <div className="cw-metric-card">
              <div className="ov-muted">Lowest Activity Window</div>
              <div className="cw-metric-val">
                {lowestHour ? formatHour(lowestHour.hour) : "—"}
              </div>
              <div className="cw-metric-sub">
                <strong>{lowestHour ? formatNumber(lowestHour.count) : "—"}</strong> cases (lowest diurnal incidence)
              </div>
            </div>
          </div>

          {/* TWO SIDE-BY-SIDE CHARTS */}
          <div className="cw-time-charts-grid">
            {/* BY DAY OF WEEK */}
            <div className="cw-chart-card">
              <div className="cw-chart-card-head">
                <div>
                  <div className="ov-eyebrow" style={{ fontSize: "9px" }}>
                    Day-of-Week Distribution
                  </div>
                  <h3 className="cw-chart-card-title">Incidents by Day</h3>
                </div>
                {peakDay && (
                  <span className="cw-peak-tag">
                    PEAK: {peakDay.day_name.toUpperCase()} ({peakDay.count})
                  </span>
                )}
              </div>

              <div className="cw-time-chart-container">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byDay} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="day_name"
                      axisLine={{ stroke: "#29292D" }}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#8A8A90" }}
                      tickFormatter={(d) => d.slice(0, 3)}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#666670" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={{
                        background: "#101012",
                        border: "1px solid #37373C",
                        borderRadius: "2px",
                        fontSize: 12,
                        color: "#F2F0ED",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      }}
                      formatter={(v) => [formatNumber(v), "Incidents"]}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                      {byDay.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            peakDay && d.day_name === peakDay.day_name
                              ? "#E2574C"
                              : "#3E3E46"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="cw-chart-footer-note">
                Highlighted red bar represents the statistically highest volume day.
              </div>
            </div>

            {/* BY HOUR OF DAY */}
            <div className="cw-chart-card">
              <div className="cw-chart-card-head">
                <div>
                  <div className="ov-eyebrow" style={{ fontSize: "9px" }}>
                    Diurnal 24-Hour Cycle
                  </div>
                  <h3 className="cw-chart-card-title">Incidents by Hour</h3>
                </div>
                {peakHour && (
                  <span className="cw-peak-tag">
                    PEAK: {formatHour(peakHour.hour).toUpperCase()} ({peakHour.count})
                  </span>
                )}
              </div>

              <div className="cw-time-chart-container">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byHour} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="hour"
                      axisLine={{ stroke: "#29292D" }}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#8A8A90" }}
                      tickFormatter={(h) => (h % 3 === 0 ? formatHour(h) : "")}
                      interval={0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#666670" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={{
                        background: "#101012",
                        border: "1px solid #37373C",
                        borderRadius: "2px",
                        fontSize: 12,
                        color: "#F2F0ED",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      }}
                      labelFormatter={(h) => `Time Window: ${formatHour(h)}`}
                      formatter={(v) => [formatNumber(v), "Incidents"]}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                      {byHour.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            peakHour && d.hour === peakHour.hour
                              ? "#E2574C"
                              : "#3E3E46"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="cw-chart-footer-note">
                Hour distribution spans midnight (12am) through late evening (11pm).
              </div>
            </div>
          </div>

          {/* TEMPORAL ADVISORY SUMMARY */}
          {peakDay && peakHour && (
            <div className="ch-alert-banner" style={{ marginTop: "24px", marginBottom: "16px" }}>
              <span className="ch-alert-tag">TEMPORAL FINDINGS</span>
              <span className="ch-alert-text">
                In <strong>{selectedArea}</strong>, crime frequency experiences significant surges on{" "}
                <strong>{peakDay.day_name}s</strong> ({formatNumber(peakDay.count)} cases) and peaks hourly around{" "}
                <strong>{formatHour(peakHour.hour)}</strong> ({formatNumber(peakHour.count)} cases). In contrast, activity is lowest around{" "}
                <strong>{lowestHour ? formatHour(lowestHour.hour) : "early morning"}</strong>.
              </span>
            </div>
          )}

          {setPage && (
            <div className="ov-footnote" style={{ marginTop: "16px" }}>
              <span>Want to plot these incidents geographically across {selectedArea}?</span>
              <button
                type="button"
                className="ov-refresh"
                onClick={() => setPage("map")}
              >
                Inspect Map View →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
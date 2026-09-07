import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

export default function TimePatterns({ selectedArea, loadingTimePattern, timePattern, peakDay, peakHour, formatHour }) {
  return (
          <div className="cw-page-wrap">
            <div className="cw-full-card">
              <div className="cw-full-card-head">
                <div className="cw-full-card-title">
                  Time patterns — {selectedArea || "select an area"}
                </div>
                <div className="cw-full-card-sub">Last 30 days</div>
              </div>

              {loadingTimePattern && (
                <div className="cw-state cw-state-dark">Loading time patterns…</div>
              )}

              {!loadingTimePattern && (
                <>
                  <div className="cw-time-grid">
                    <div>
                      <div className="cw-full-card-title" style={{ marginBottom: 10 }}>
                        By day of week
                      </div>
                      <div className="cw-time-chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timePattern.by_day}>
                            <XAxis
                              dataKey="day_name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "#8A8A90" }}
                              tickFormatter={(d) => d.slice(0, 3)}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#0B0B0D",
                                border: "none",
                                borderRadius: 10,
                                fontSize: 12,
                                color: "#F5F3F0",
                              }}
                              formatter={(v) => [v, "Incidents"]}
                            />
                            <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                              {timePattern.by_day.map((d, i) => (
                                <Cell
                                  key={i}
                                  fill={
                                    peakDay && d.day_name === peakDay.day_name
                                      ? "#E2574C"
                                      : "#F5F3F0"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <div className="cw-full-card-title" style={{ marginBottom: 10 }}>
                        By hour of day
                      </div>
                      <div className="cw-time-chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timePattern.by_hour}>
                            <XAxis
                              dataKey="hour"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: "#8A8A90" }}
                              tickFormatter={(h) => (h % 3 === 0 ? formatHour(h) : "")}
                              interval={0}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#0B0B0D",
                                border: "none",
                                borderRadius: 10,
                                fontSize: 12,
                                color: "#F5F3F0",
                              }}
                              labelFormatter={(h) => formatHour(h)}
                              formatter={(v) => [v, "Incidents"]}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {timePattern.by_hour.map((d, i) => (
                                <Cell
                                  key={i}
                                  fill={
                                    peakHour && d.hour === peakHour.hour
                                      ? "#E2574C"
                                      : "#F5F3F0"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {peakDay && peakHour && (
                    <div className="cw-time-insight">
                      In <strong>{selectedArea}</strong>, incidents peak on{" "}
                      <strong>{peakDay.day_name}</strong> ({peakDay.count} cases)
                      and around <strong>{formatHour(peakHour.hour)}</strong> (
                      {peakHour.count} cases), over the last 30 days. Red bars
                      mark the peak in each chart.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
  );
}
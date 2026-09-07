import Gauge from "../components/Gauge";
import Ring from "../components/Ring";
import TickBar from "../components/TickBar";
import timeAgo from "../utils/timeAgo";

export default function Overview({ areaPercent, areaCount, areaRank, maxCount, loadingBreakdown, topTwoTypes, breakdownTotal, loadingArrests, arrests, loadingNews, articles, selectedArea, loadNews }) {
  return (
          <div className="cw-grid">
            <div className="cw-card">
              <div className="cw-card-head">
                <div className="cw-card-title">Hotspot severity</div>
                <div className="cw-card-more">···</div>
              </div>
              <div className="cw-gauge-wrap">
                <Gauge percent={areaPercent} />
                <div className="cw-gauge-center">
                  <div className="cw-gauge-total">{areaCount || "—"}</div>
                  <div className="cw-gauge-total-label">Incidents, 30 days</div>
                </div>
              </div>
              <div className="cw-gauge-stats">
                <div className="cw-gauge-stat">
                  <div className="cw-gauge-stat-value">
                    {areaRank ? `#${areaRank}` : "—"}
                  </div>
                  <div className="cw-gauge-stat-label">City rank</div>
                </div>
                <div className="cw-gauge-stat">
                  <div className="cw-gauge-stat-value">{maxCount}</div>
                  <div className="cw-gauge-stat-label">City max</div>
                </div>
                <div className="cw-gauge-stat">
                  <div className="cw-gauge-stat-value">
                    {Math.round(areaPercent)}%
                  </div>
                  <div className="cw-gauge-stat-label">Of peak area</div>
                </div>
              </div>
            </div>

            <div className="cw-card">
              <div className="cw-card-head">
                <div className="cw-card-title">Leading crime types</div>
                <div className="cw-card-more">···</div>
              </div>
              {loadingBreakdown && (
                <div className="cw-state cw-state-dark" style={{ padding: "20px 0" }}>
                  Loading breakdown…
                </div>
              )}
              {!loadingBreakdown && topTwoTypes.length === 0 && (
                <div className="cw-news-empty">No category data for this area yet.</div>
              )}
              {!loadingBreakdown &&
                topTwoTypes.map((t) => {
                  const pct = breakdownTotal
                    ? (t.type_count / breakdownTotal) * 100
                    : 0;
                  return (
                    <div className="cw-type-row" key={t.primary_type}>
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

            <div className="cw-card">
              <div className="cw-card-head">
                <div className="cw-card-title">Arrest rate</div>
                <div className="cw-card-more">···</div>
              </div>
              {loadingArrests && (
                <div className="cw-state cw-state-dark" style={{ padding: "20px 0" }}>
                  Loading…
                </div>
              )}
              {!loadingArrests && arrests && (
                <>
                  <div className="cw-arrest-ring-wrap">
                    <Ring
                      percent={arrests.arrest_rate}
                      color={arrests.arrest_rate >= 30 ? "#F5F3F0" : "#E2574C"}
                    />
                    <div className="cw-arrest-ring-center">
                      <div className="cw-arrest-rate">{arrests.arrest_rate}%</div>
                      <div className="cw-arrest-rate-label">arrest rate</div>
                    </div>
                  </div>
                  <div className="cw-arrest-stats">
                    <div className="cw-gauge-stat">
                      <div className="cw-gauge-stat-value">{arrests.total_arrests}</div>
                      <div className="cw-gauge-stat-label">Arrests</div>
                    </div>
                    <div className="cw-gauge-stat">
                      <div className="cw-gauge-stat-value">{arrests.total_crimes}</div>
                      <div className="cw-gauge-stat-label">Total cases</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="cw-card">
              <div className="cw-card-head">
                <div className="cw-card-title">Latest coverage</div>
                <div className="cw-card-more">···</div>
              </div>

              {loadingNews && (
                <div className="cw-state cw-state-dark" style={{ padding: "20px 0" }}>
                  Fetching news…
                </div>
              )}

              {!loadingNews && articles.length === 0 && (
                <div className="cw-news-empty">
                  No recent coverage found, even in general Chicago crime
                  news. This usually means the NewsAPI daily quota (100
                  requests/day) has been reached — check the Flask terminal.
                </div>
              )}

              {!loadingNews && articles.length > 0 && (
                <span
                  className={
                    "cw-news-scope-badge " +
                    (articles[0].is_area_specific
                      ? "cw-news-scope-specific"
                      : "cw-news-scope-general")
                  }
                >
                  {articles[0].is_area_specific
                    ? `About ${selectedArea}`
                    : "General Chicago coverage"}
                </span>
              )}

              <div className="cw-news-list">
                {!loadingNews &&
                  articles.slice(0, 3).map((a, i) => (
                    <div className="cw-news-item" key={a.url || i}>
                      <p className="cw-news-title">{a.title}</p>
                      <div className="cw-news-source">
                        {a.source_name || a.source?.name || "Unknown source"} ·{" "}
                        {timeAgo(a.published_at || a.publishedAt)}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="cw-btn-row">
                <a
                  className="cw-btn cw-btn-primary"
                  href={articles[0]?.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open article
                </a>
                <button
                  className="cw-btn cw-btn-secondary"
                  onClick={() => loadNews(selectedArea)}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
  );
}
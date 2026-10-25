
import timeAgo from "../utils/timeAgo";

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("en-US")
    : "—";
}

function Track({ percent, primary = false }) {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

  return (
    <div className="ov-track ov-type-track">
      <div
        className={
          "ov-track-fill" + (primary ? " ov-fill-primary" : "")
        }
        style={{ width: `${safePercent}%` }}
      />
    </div>
  );
}

export default function Overview({
  areaPercent = 0,
  areaCount = 0,
  areaRank,
  maxCount = 0,
  loadingBreakdown,
  topTwoTypes = [],
  breakdownTotal = 0,
  loadingArrests,
  arrests,
  loadingNews,
  articles = [],
  selectedArea,
  days = 30,
  momentum,
  loadNews,
}) {
  const safePercent = Math.max(
    0,
    Math.min(100, Number(areaPercent) || 0)
  );

  const arrestRate = Math.max(
    0,
    Math.min(100, Number(arrests?.arrest_rate) || 0)
  );

  return (
    <section className="overview-layout">
      {/* AREA SUMMARY */}
      <article className="ov-card ov-area">
        <div className="ov-eyebrow">
          <span className="ov-status-dot" />
          Selected community area
          <span className="ov-index">01 / 04</span>
        </div>

        <div className="ov-area-heading">
          <div>
            <div className="ov-muted">Current selection</div>
            <h2>{selectedArea || "Chicago"}</h2>
          </div>

          <div className="ov-rank">
            <span className="ov-muted">City rank</span>
            <strong>{areaRank ? `#${areaRank}` : "—"}</strong>
          </div>
        </div>

        <div className="ov-main-metric">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="ov-muted">Reported incidents</div>
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
            <div className="ov-big-number">
              {formatNumber(areaCount)}
            </div>
            <div className="ov-muted ov-period">
              Most recent {days}-day window in the database
            </div>
          </div>

          <div className="ov-peak">
            <span className="ov-muted">Share of city peak</span>
            <strong>{Math.round(safePercent)}%</strong>
            <Track percent={safePercent} primary />
            <span className="ov-muted">
              Peak area: {formatNumber(maxCount)} incidents
            </span>
          </div>
        </div>

        <div className="ov-footnote">
          <span>Area incident count</span>
          <strong>{formatNumber(areaCount)}</strong>
        </div>
      </article>

      {/* CRIME BREAKDOWN */}
      <article className="ov-card ov-crimes">
        <div className="ov-section-heading">
          <div>
            <div className="ov-eyebrow">02 / Crime composition</div>
            <h3>What is driving the count?</h3>
          </div>
          <span className="ov-muted">Top categories</span>
        </div>

        {loadingBreakdown ? (
          <div className="ov-empty">Loading crime categories…</div>
        ) : topTwoTypes.length === 0 ? (
          <div className="ov-empty">
            No crime category data is available for this area yet.
          </div>
        ) : (
          <div className="ov-type-list">
            {topTwoTypes.map((item, index) => {
              const count = Number(item.type_count) || 0;
              const percent = breakdownTotal
                ? (count / breakdownTotal) * 100
                : 0;

              return (
                <div className="ov-type" key={item.primary_type}>
                  <div className="ov-type-heading">
                    <span className="ov-type-name">
                      <span className="ov-type-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.primary_type}
                    </span>
                    <strong>{Math.round(percent)}%</strong>
                  </div>

                  <Track percent={percent} primary={index === 0} />

                  <div className="ov-type-footer">
                    <span>Reported incidents</span>
                    <span>{formatNumber(count)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="ov-card-note">
          Shares are calculated from the category totals returned by the
          dashboard for the selected area and reporting window.
        </p>
      </article>

      {/* ARREST DATA */}
      <article className="ov-card ov-arrests">
        <div className="ov-section-heading">
          <div>
            <div className="ov-eyebrow">03 / Enforcement outcome</div>
            <h3>Arrests recorded</h3>
          </div>
          <span className="ov-muted">Selected area</span>
        </div>

        {loadingArrests ? (
          <div className="ov-empty">Loading arrest data…</div>
        ) : arrests ? (
          <>
            <div className="ov-arrest-main">
              <div className="ov-arrest-number">
                {Math.round(arrestRate)}
                <span>%</span>
              </div>
              <div className="ov-arrest-caption">
                of recorded incidents marked as arrests
              </div>
            </div>

            <div className="ov-track ov-arrest-track">
              <div
                className="ov-track-fill ov-fill-primary"
                style={{ width: `${arrestRate}%` }}
              />
            </div>

            <div className="ov-arrest-breakdown">
              <div>
                <span className="ov-muted">Arrests</span>
                <strong>{formatNumber(arrests.total_arrests)}</strong>
              </div>
              <div>
                <span className="ov-muted">Total incidents</span>
                <strong>{formatNumber(arrests.total_crimes)}</strong>
              </div>
            </div>

            <p className="ov-card-note">
              An arrest is not the same as a conviction. These figures
              describe recorded data, not the outcome of a court case.
            </p>
          </>
        ) : (
          <div className="ov-empty">
            Arrest data is currently unavailable for this area.
          </div>
        )}
      </article>

      {/* NEWS */}
      <article className="ov-card ov-news">
        <div className="ov-section-heading">
          <div>
            <div className="ov-eyebrow">04 / News desk</div>
            <h3>Related coverage</h3>
          </div>

          <button
            type="button"
            className="ov-refresh"
            onClick={() => loadNews(selectedArea)}
            disabled={loadingNews}
          >
            {loadingNews ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {loadingNews ? (
          <div className="ov-empty">Checking available coverage…</div>
        ) : articles.length === 0 ? (
          <div className="ov-news-unavailable">
            <div className="ov-news-symbol">!</div>
            <div>
              <strong>No articles returned</strong>
              <p>
                No matching coverage is currently available. This can
                happen because of API limits or a lack of matching
                articles; it does not mean no incidents occurred.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="ov-news-scope">
              {articles[0]?.is_area_specific
                ? `AREA COVERAGE · ${selectedArea || "SELECTED AREA"}`
                : "GENERAL CHICAGO COVERAGE"}
            </div>

            <div className="ov-news-list">
              {articles.slice(0, 3).map((article, index) => (
                <a
                  className="ov-news-item"
                  key={article.url || index}
                  href={article.url || undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="ov-news-item-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h4>{article.title || "Untitled article"}</h4>
                    <p>
                      {article.source_name ||
                        article.source?.name ||
                        "News source"}
                      {" · "}
                      {timeAgo(
                        article.published_at || article.publishedAt
                      )}
                    </p>
                  </div>

                  <span className="ov-news-arrow">↗</span>
                </a>
              ))}
            </div>
          </>
        )}

        <div className="ov-news-footer">
          <span>EXTERNAL NEWS COVERAGE</span>
          <span>VERIFY AT SOURCE</span>
        </div>
      </article>
    </section>
  );
}

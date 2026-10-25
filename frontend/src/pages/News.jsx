import timeAgo from "../utils/timeAgo";

function getDomain(url) {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

export default function News({
  selectedArea,
  loadingNews,
  articles = [],
  loadNews,
  setPage,
}) {
  const isAreaSpecific = articles.length > 0 && articles[0]?.is_area_specific;

  return (
    <div className="cw-page-wrap">
      {/* HEADER SECTION */}
      <div className="cw-full-card-head cw-hotspot-header">
        <div>
          <div className="ov-eyebrow">
            <span className="ov-status-dot" />
            Media Surveillance · Local News Desk
            <span className="ov-index">04 / DISPATCH</span>
          </div>
          <h2 className="cw-page-title">
            Coverage — {selectedArea || "Chicago"}
          </h2>
          <p className="cw-page-subtitle">
            Local news reports, police blotters, and journalistic coverage concerning {selectedArea || "Chicago"}.
          </p>
        </div>

        <div className="cw-header-metrics">
          <button
            type="button"
            className="ov-refresh cw-btn-refresh"
            onClick={() => loadNews(selectedArea)}
            disabled={loadingNews}
          >
            {loadingNews ? "Checking feeds…" : "Refresh Coverage ↻"}
          </button>
        </div>
      </div>

      {/* SCOPE BANNER */}
      {!loadingNews && articles.length > 0 && (
        <div
          className={
            "cw-news-scope-alert " +
            (isAreaSpecific ? "cw-scope-specific" : "cw-scope-general")
          }
        >
          <span className="cw-scope-dot" />
          <span>
            {isAreaSpecific
              ? `Filtered to localized reporting mentioning "${selectedArea}"`
              : `No direct matches for "${selectedArea}" in recent news — displaying broader Chicago metropolitan crime reports`}
          </span>
          <span className="cw-scope-count">{articles.length} ARTICLES</span>
        </div>
      )}

      {loadingNews && (
        <div className="cw-full-card">
          <div className="ov-empty">Scanning Chicago RSS feeds and NewsAPI wire…</div>
        </div>
      )}

      {!loadingNews && articles.length === 0 && (
        <div className="cw-full-card">
          <div className="ov-news-unavailable">
            <div className="ov-news-symbol">!</div>
            <div>
              <strong>No coverage returned</strong>
              <p>
                No news articles are currently available for this query. This can happen if
                the NewsAPI daily quota has been reached, or if no recent stories mention this specific area.
                Click "Refresh Coverage ↻" or select another area above.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loadingNews && articles.length > 0 && (
        <div className="cw-news-cards-grid">
          {articles.map((a, i) => {
            const sourceName = a.source_name || a.source?.name || getDomain(a.url);
            const published = a.published_at || a.publishedAt;

            return (
              <article className="cw-news-card" key={a.url || i}>
                <div className="cw-news-card-top">
                  <div className="cw-news-source-tag">
                    <span className="cw-news-tag-index">{String(i + 1).padStart(2, "0")}</span>
                    <span>{sourceName}</span>
                  </div>
                  <span className="cw-news-time-badge">{timeAgo(published)}</span>
                </div>

                <h3 className="cw-news-headline">
                  <a href={a.url} target="_blank" rel="noopener noreferrer">
                    {a.title}
                  </a>
                </h3>

                {a.description && (
                  <p className="cw-news-excerpt">{a.description}</p>
                )}

                <div className="cw-news-card-footer">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cw-news-link"
                  >
                    Read full story ↗
                  </a>
                  <span className="cw-news-domain">{getDomain(a.url)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="ov-footnote" style={{ marginTop: "24px" }}>
        <span>News articles are indexed from independent outlets and aggregated for educational analysis.</span>
        {setPage && (
          <button
            type="button"
            className="ov-refresh"
            onClick={() => setPage("home")}
          >
            ← Return to Dashboard Home
          </button>
        )}
      </div>
    </div>
  );
}

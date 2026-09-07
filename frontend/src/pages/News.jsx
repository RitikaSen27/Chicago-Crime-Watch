import timeAgo from "../utils/timeAgo";

export default function News({ selectedArea, loadingNews, articles, loadNews }) {
  return (
          <div className="cw-page-wrap">
            <div className="cw-full-card">
              <div className="cw-full-card-head">
                <div className="cw-full-card-title">
                  Coverage — {selectedArea || "select an area"}
                </div>
                <button
                  className="cw-btn cw-btn-secondary"
                  style={{ padding: "8px 16px", flex: "none" }}
                  onClick={() => loadNews(selectedArea)}
                >
                  Refresh
                </button>
              </div>
              {loadingNews && (
                <div className="cw-state cw-state-dark">Fetching news…</div>
              )}
              {!loadingNews && articles.length === 0 && (
                <div className="cw-news-empty">
                  No coverage found at all right now, even general Chicago
                  crime news. This most likely means the NewsAPI free-tier
                  daily quota (100 requests/day) has been used up — check the
                  Flask terminal for an error, or try again tomorrow when it
                  resets.
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
                    ? `Specific to ${selectedArea}`
                    : `No coverage found naming "${selectedArea}" — showing general Chicago crime news instead`}
                </span>
              )}
              {!loadingNews &&
                articles.map((a, i) => (
                  <div className="cw-full-news-item" key={a.url || i}>
                    <h3 className="cw-full-news-title">
                      <a href={a.url} target="_blank" rel="noreferrer">
                        {a.title}
                      </a>
                    </h3>
                    {a.description && (
                      <p className="cw-full-news-desc">{a.description}</p>
                    )}
                    <div className="cw-full-news-source">
                      {a.source_name || a.source?.name || "Unknown source"} ·{" "}
                      {timeAgo(a.published_at || a.publishedAt)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
  );
}

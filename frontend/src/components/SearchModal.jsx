import { useState, useEffect, useRef } from "react";

const PAGES = [
  { key: "home", label: "Home", desc: "Executive dashboard summary & citywide incident trends" },
  { key: "overview", label: "Overview", desc: "Selected community area deep-dive, composition & arrests" },
  { key: "hotspots", label: "Hotspots", desc: "Ranked index of top 10 highest-activity community areas" },
  { key: "types", label: "Crime Types", desc: "Offense taxonomy and category frequency breakdown" },
  { key: "time", label: "Time Patterns", desc: "Diurnal 24-hour cycles and day-of-week surge analysis" },
  { key: "map", label: "Map", desc: "Geographic scatter map of individual incident coordinates" },
  { key: "news", label: "News", desc: "Local journalistic reporting and news wire coverage" },
];

const CRIME_TYPES = [
  "BATTERY",
  "THEFT",
  "CRIMINAL DAMAGE",
  "ASSAULT",
  "DECEPTIVE PRACTICE",
  "ROBBERY",
  "BURGLARY",
  "MOTOR VEHICLE THEFT",
  "NARCOTICS",
  "WEAPONS VIOLATION",
];

export default function SearchModal({
  isOpen,
  onClose,
  hotspots = [],
  selectedArea,
  setSelectedArea,
  setPage,
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Filter hotspots/community areas
  const matchedAreas = hotspots.filter((h) =>
    h.area_name.toLowerCase().includes(q)
  );

  // Filter pages
  const matchedPages = PAGES.filter(
    (p) => p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  );

  // Filter crime types
  const matchedCrimes = CRIME_TYPES.filter((c) =>
    c.toLowerCase().includes(q)
  );

  function handleSelectArea(areaName) {
    setSelectedArea(areaName);
    onClose();
  }

  function handleSelectPage(pageKey) {
    setPage(pageKey);
    onClose();
  }

  function handleSelectCrime() {
    setPage("types");
    onClose();
  }

  const hasResults =
    matchedAreas.length > 0 || matchedPages.length > 0 || matchedCrimes.length > 0;

  return (
    <div className="cw-search-overlay" onClick={onClose}>
      <div
        className="cw-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* INPUT BAR */}
        <div className="cw-search-bar">
          <span className="cw-search-icon" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            type="text"
            className="cw-search-input"
            placeholder="Search community areas, crime types, or dashboard pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button
              type="button"
              className="cw-search-clear"
              onClick={() => setQuery("")}
              title="Clear"
            >
              ✕
            </button>
          ) : (
            <span className="cw-search-kbd">ESC</span>
          )}
        </div>

        {/* RESULTS CONTAINER */}
        <div className="cw-search-results">
          {!hasResults && (
            <div className="cw-search-empty">
              No matching areas, pages, or offenses found for "{query}".
            </div>
          )}

          {/* COMMUNITY AREAS */}
          {matchedAreas.length > 0 && (
            <div className="cw-search-section">
              <div className="cw-search-section-title">
                <span>COMMUNITY AREAS (HOTSPOTS)</span>
                <span>{matchedAreas.length} MATCHES</span>
              </div>
              <div className="cw-search-list">
                {matchedAreas.map((h, i) => {
                  const isSelected = selectedArea === h.area_name;
                  return (
                    <div
                      key={h.area_number ?? h.area_name}
                      className={"cw-search-item" + (isSelected ? " cw-search-item-active" : "")}
                      onClick={() => handleSelectArea(h.area_name)}
                    >
                      <div className="cw-search-item-left">
                        <span className="cw-search-badge">
                          RANK #{String(i + 1).padStart(2, "0")}
                        </span>
                        <strong className="cw-search-item-name">{h.area_name}</strong>
                        {isSelected && <span className="cw-active-badge">CURRENT</span>}
                      </div>
                      <div className="cw-search-item-right">
                        <span>{h.crime_count} cases</span>
                        <span className="cw-search-arrow">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAGES */}
          {matchedPages.length > 0 && (
            <div className="cw-search-section">
              <div className="cw-search-section-title">
                <span>DASHBOARD VIEWS</span>
                <span>{matchedPages.length}</span>
              </div>
              <div className="cw-search-list">
                {matchedPages.map((p) => (
                  <div
                    key={p.key}
                    className="cw-search-item"
                    onClick={() => handleSelectPage(p.key)}
                  >
                    <div className="cw-search-item-left">
                      <span className="cw-search-type-tag">VIEW</span>
                      <strong className="cw-search-item-name">{p.label}</strong>
                      <span className="cw-search-desc">{p.desc}</span>
                    </div>
                    <div className="cw-search-item-right">
                      <span className="cw-search-arrow">Jump →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OFFENSE TYPES */}
          {matchedCrimes.length > 0 && (
            <div className="cw-search-section">
              <div className="cw-search-section-title">
                <span>CRIME CATEGORIES</span>
                <span>{matchedCrimes.length}</span>
              </div>
              <div className="cw-search-list">
                {matchedCrimes.map((c) => (
                  <div
                    key={c}
                    className="cw-search-item"
                    onClick={() => handleSelectCrime(c)}
                  >
                    <div className="cw-search-item-left">
                      <span className="cw-search-crime-tag">OFFENSE</span>
                      <strong className="cw-search-item-name">{c}</strong>
                    </div>
                    <div className="cw-search-item-right">
                      <span className="cw-search-arrow">Inspect Breakdown →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="cw-search-footer">
          <span>Tip: Click an area to instantly set it active across all pages</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}

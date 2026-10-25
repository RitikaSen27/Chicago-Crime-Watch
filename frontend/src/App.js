import { useState, useEffect } from "react";
import "./App.css";

import useDashboardData from "./hooks/useDashboardData";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Overview from "./pages/Overview";
import Hotspots from "./pages/Hotspots";
import CrimeTypes from "./pages/CrimeTypes";
import TimePatterns from "./pages/TimePatterns";
import MapView from "./pages/MapView";
import News from "./pages/News";
import Footer from "./pages/Footer";
import SearchModal from "./components/SearchModal";
import CompareModal from "./components/CompareModal";
import TelemetryTicker from "./components/TelemetryTicker";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("cw-theme") || "dark");

  const {
    days,
    setDays,
    hotspots,
    loadingHotspots,
    hotspotError,
    summary,
    selectedArea,
    setSelectedArea,
    articles,
    loadingNews,
    loadNews,
    breakdown,
    loadingBreakdown,
    arrests,
    loadingArrests,
    timePattern,
    loadingTimePattern,
    locations,
    loadingLocations,
    lastRefreshed,
    page,
    setPage,
    maxCount,
    areaCount,
    areaPercent,
    areaRank,
    breakdownTotal,
    topTwoTypes,
    trendData,
    momentum,
    violentCount,
    propertyCount,
    violentPercent,
    propertyPercent,
    peakDay,
    peakHour,
    formatHour,
  } = useDashboardData();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cw-theme", theme);
  }, [theme]);

  // Global Keyboard shortcuts:
  // - Ctrl+K: Search
  // - [ and ]: Cycle through community areas
  // - 1-7: Switch page tabs
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "[" && hotspots.length > 0) {
        // Previous area
        const idx = hotspots.findIndex((h) => h.area_name === selectedArea);
        const prevIdx = idx > 0 ? idx - 1 : hotspots.length - 1;
        setSelectedArea(hotspots[prevIdx].area_name);
      } else if (e.key === "]" && hotspots.length > 0) {
        // Next area
        const idx = hotspots.findIndex((h) => h.area_name === selectedArea);
        const nextIdx = idx < hotspots.length - 1 ? idx + 1 : 0;
        setSelectedArea(hotspots[nextIdx].area_name);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotspots, selectedArea, setSelectedArea]);

  function handleNav(targetPage) {
    setPage(targetPage);
  }

  function handleAreaSelect(name) {
    setSelectedArea(name);
  }

  if (!entered) {
    return <LandingPage onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="cw-root">
      <div className="cw-shell">
        <header className="cw-nav">
          <div className="cw-brand">
            <div className="cw-brand-mark">
              <span />
            </div>
            <div className="cw-brand-name">Crime Watch</div>
          </div>

          <nav className="cw-pills">
            {[
              ["home", "Home"],
              ["overview", "Overview"],
              ["hotspots", "Hotspots"],
              ["types", "Crime types"],
              ["time", "Time patterns"],
              ["map", "Map"],
              ["news", "News"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={
                  "cw-pill" + (page === key ? " cw-pill-active" : "")
                }
                onClick={() => handleNav(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="cw-nav-icons">
            {/* TIME HORIZON SELECTOR (7D / 30D / 90D) */}
            <div className="cw-days-group" title="Select time horizon">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={"cw-days-btn" + (days === d ? " cw-days-active" : "")}
                  onClick={() => setDays(d)}
                >
                  {d}D
                </button>
              ))}
            </div>

            {/* COMPARE AREAS BUTTON */}
            <button
              type="button"
              className="cw-icon-btn cw-compare-trigger"
              onClick={() => setCompareOpen(true)}
              title="Compare two community areas side-by-side"
              aria-label="Compare areas"
            >
              <span>⚖</span>
              <span className="cw-btn-label">Compare</span>
            </button>

            {/* SEARCH PALETTE BUTTON */}
            <button
              type="button"
              className="cw-icon-btn cw-search-trigger"
              onClick={() => setSearchOpen(true)}
              title="Search community areas, pages, or crime types (Ctrl+K)"
              aria-label="Open search dialog"
            >
              <span aria-hidden="true" style={{ fontSize: "16px" }}>⌕</span>
              <span className="cw-search-key-badge">Ctrl+K</span>
            </button>

            {/* THEME TOGGLE */}
            <button
              type="button"
              className="cw-icon-btn cw-theme-toggle"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle dark/light theme"
            >
              <span aria-hidden="true" style={{ fontSize: "16px" }}>
                {theme === "dark" ? "☼" : "☾"}
              </span>
            </button>

            <div className="cw-avatar" title="Chicago Crime Watch">CW</div>
          </div>
        </header>

        {/* LIVE INTELLIGENCE TELEMETRY TICKER */}
        <TelemetryTicker
          hotspots={hotspots}
          leader={hotspots[0]}
          lastRefreshed={lastRefreshed}
          onAreaClick={handleAreaSelect}
        />

        {hotspotError && (
          <div className="cw-error-banner">{hotspotError}</div>
        )}

        {page !== "home" && (
          <div className="cw-chips-row">
            {hotspots.map((h, i) => (
              <button
                type="button"
                key={h.area_number ?? h.area_name}
                className={
                  "cw-chip" +
                  (selectedArea === h.area_name ? " cw-chip-active" : "")
                }
                onClick={() => handleAreaSelect(h.area_name)}
              >
                <span className="cw-chip-rank">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{h.area_name}</span>
                <span className="cw-chip-count">{h.crime_count}</span>
              </button>
            ))}
          </div>
        )}

        {page === "home" && (
          <Home
            hotspots={hotspots}
            loadingHotspots={loadingHotspots}
            summary={summary}
            trendData={trendData}
            lastRefreshed={lastRefreshed}
            days={days}
            momentum={momentum}
            setPage={handleNav}
            setSelectedArea={handleAreaSelect}
          />
        )}

        {page === "overview" && (
          <Overview
            areaPercent={areaPercent}
            areaCount={areaCount}
            areaRank={areaRank}
            maxCount={maxCount}
            loadingBreakdown={loadingBreakdown}
            topTwoTypes={topTwoTypes}
            breakdownTotal={breakdownTotal}
            loadingArrests={loadingArrests}
            arrests={arrests}
            loadingNews={loadingNews}
            articles={articles}
            selectedArea={selectedArea}
            days={days}
            momentum={momentum}
            loadNews={loadNews}
          />
        )}

        {page === "hotspots" && (
          <Hotspots
            hotspots={hotspots}
            loadingHotspots={loadingHotspots}
            selectedArea={selectedArea}
            setSelectedArea={handleAreaSelect}
            maxCount={maxCount}
            days={days}
            momentum={momentum}
            onOpenCompare={() => setCompareOpen(true)}
            setPage={handleNav}
          />
        )}

        {page === "types" && (
          <CrimeTypes
            selectedArea={selectedArea}
            areaRank={areaRank}
            areaCount={areaCount}
            loadingBreakdown={loadingBreakdown}
            breakdown={breakdown}
            breakdownTotal={breakdownTotal}
            days={days}
            momentum={momentum}
            violentCount={violentCount}
            propertyCount={propertyCount}
            violentPercent={violentPercent}
            propertyPercent={propertyPercent}
            setPage={handleNav}
          />
        )}

        {page === "time" && (
          <TimePatterns
            selectedArea={selectedArea}
            loadingTimePattern={loadingTimePattern}
            timePattern={timePattern}
            peakDay={peakDay}
            peakHour={peakHour}
            formatHour={formatHour}
            setPage={handleNav}
          />
        )}

        {page === "map" && (
          <MapView
            selectedArea={selectedArea}
            loadingLocations={loadingLocations}
            locations={locations}
            setPage={handleNav}
          />
        )}

        {page === "news" && (
          <News
            selectedArea={selectedArea}
            loadingNews={loadingNews}
            articles={articles}
            loadNews={loadNews}
            setPage={handleNav}
          />
        )}

        <Footer />
      </div>

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        hotspots={hotspots}
        selectedArea={selectedArea}
        setSelectedArea={handleAreaSelect}
        setPage={handleNav}
      />

      {/* COMPARE SECTORS MODAL */}
      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        hotspots={hotspots}
        initialAreaA={selectedArea}
        setSelectedArea={handleAreaSelect}
        setPage={handleNav}
      />
    </div>
  );
}

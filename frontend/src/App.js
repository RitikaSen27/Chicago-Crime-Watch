import { useState } from "react";
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

export default function App() {
  const [entered, setEntered] = useState(false);
  const {
    hotspots, loadingHotspots, hotspotError,
    summary,
    selectedArea, setSelectedArea,
    articles, loadingNews, loadNews,
    breakdown, loadingBreakdown,
    arrests, loadingArrests,
    timePattern, loadingTimePattern,
    locations, loadingLocations,
    lastRefreshed,
    page, setPage,
    maxCount, areaCount, areaPercent, areaRank,
    breakdownTotal, topTwoTypes,
    trendData,
    peakDay, peakHour, formatHour,
  } = useDashboardData();

  if (!entered) {
    return <LandingPage onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="cw-root">
      <div className="cw-shell">
        <div className="cw-nav">
          <div className="cw-brand">
            <div className="cw-brand-mark">
              <span />
            </div>
            <div className="cw-brand-name">Crime Watch</div>
          </div>

          <div className="cw-pills">
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
                className={"cw-pill" + (page === key ? " cw-pill-active" : "")}
                onClick={() => setPage(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="cw-nav-icons">
            <div className="cw-icon-btn">⌕</div>
            <div className="cw-icon-btn">◔</div>
            <div className="cw-avatar">CW</div>
          </div>
        </div>

        {hotspotError && <div className="cw-error-banner">{hotspotError}</div>}

        {page !== "home" && (
          <div className="cw-chips-row">
            {hotspots.map((h, i) => (
              <div
                key={h.area_number}
                className={
                  "cw-chip" + (selectedArea === h.area_name ? " cw-chip-active" : "")
                }
                onClick={() => setSelectedArea(h.area_name)}
              >
                <span className="cw-chip-rank">{String(i + 1).padStart(2, "0")}</span>
                <span>{h.area_name}</span>
                <span className="cw-chip-count">{h.crime_count}</span>
              </div>
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
            setPage={setPage}
            setSelectedArea={setSelectedArea}
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
            loadNews={loadNews}
          />
        )}

        {page === "hotspots" && (
          <Hotspots
            hotspots={hotspots}
            loadingHotspots={loadingHotspots}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            maxCount={maxCount}
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
          />
        )}

        {page === "map" && (
          <MapView
            selectedArea={selectedArea}
            loadingLocations={loadingLocations}
            locations={locations}
          />
        )}

        {page === "news" && (
          <News
            selectedArea={selectedArea}
            loadingNews={loadingNews}
            articles={articles}
            loadNews={loadNews}
          />
        )}

        <Footer />
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : "—";
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function MapView({
  selectedArea,
  loadingLocations,
  locations = [],
  setPage,
}) {
  const [viewMode, setViewMode] = useState("scatter"); // 'scatter' | 'heatmap'
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [arrestFilter, setArrestFilter] = useState("ALL"); // 'ALL' | 'ARREST' | 'NO_ARREST'

  // Extract available crime categories from locations
  const categories = useMemo(() => {
    const counts = {};
    locations.forEach((d) => {
      const type = d.primary_type || "OTHER";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [locations]);

  // Filter locations by category and arrest status
  const filteredLocations = useMemo(() => {
    return locations.filter((d) => {
      const matchesCategory =
        categoryFilter === "ALL" || d.primary_type === categoryFilter;
      const matchesArrest =
        arrestFilter === "ALL" ||
        (arrestFilter === "ARREST" && d.arrest) ||
        (arrestFilter === "NO_ARREST" && !d.arrest);
      return matchesCategory && matchesArrest;
    });
  }, [locations, categoryFilter, arrestFilter]);

  const center = useMemo(() => {
    if (!filteredLocations.length) {
      if (!locations.length) return [41.8781, -87.6298];
      return [locations[0].latitude, locations[0].longitude];
    }
    const avgLat =
      filteredLocations.reduce((s, d) => s + d.latitude, 0) /
      filteredLocations.length;
    const avgLng =
      filteredLocations.reduce((s, d) => s + d.longitude, 0) /
      filteredLocations.length;
    return [avgLat, avgLng];
  }, [filteredLocations, locations]);

  const arrestCount = useMemo(
    () => filteredLocations.filter((d) => d.arrest).length,
    [filteredLocations]
  );
  const arrestRate = filteredLocations.length
    ? Math.round((arrestCount / filteredLocations.length) * 100)
    : 0;

  return (
    <div className="cw-page-wrap">
      {/* HEADER SECTION */}
      <div className="cw-full-card-head cw-hotspot-header">
        <div>
          <div className="ov-eyebrow">
            <span className="ov-status-dot" />
            Geospatial Telemetry · Tactical Map
            <span className="ov-index">04 / MAP</span>
          </div>
          <h2 className="cw-page-title">
            Incident Map — {selectedArea || "Chicago"}
          </h2>
          <p className="cw-page-subtitle">
            Interactive GIS plotting of incidents in {selectedArea || "this sector"}, supporting heatmap density mode and offense filtering.
          </p>
        </div>

        <div className="cw-header-metrics">
          <div className="cw-stat-chip">
            <span className="cw-stat-chip-label">Filtered Points</span>
            <strong className="cw-stat-chip-val">{formatNumber(filteredLocations.length)}</strong>
          </div>
          <div className="cw-stat-chip">
            <span className="cw-stat-chip-label">Clearance (Arrest Rate)</span>
            <strong className="cw-stat-chip-val" style={{ color: "#E2574C" }}>
              {arrestRate}% ({arrestCount} arrests)
            </strong>
          </div>
        </div>
      </div>

      {/* TACTICAL MAP CONTROLS BAR */}
      <div className="cw-map-controls-bar">
        {/* VIEW MODE TOGGLE */}
        <div className="cw-map-toggle-group">
          <button
            type="button"
            className={"cw-map-toggle-btn" + (viewMode === "scatter" ? " cw-toggle-active" : "")}
            onClick={() => setViewMode("scatter")}
          >
            Scatter Pins
          </button>
          <button
            type="button"
            className={"cw-map-toggle-btn" + (viewMode === "heatmap" ? " cw-toggle-active" : "")}
            onClick={() => setViewMode("heatmap")}
          >
            Density Heatmap
          </button>
        </div>

        {/* ARREST FILTER */}
        <div className="cw-map-toggle-group">
          <button
            type="button"
            className={"cw-map-toggle-btn" + (arrestFilter === "ALL" ? " cw-toggle-active" : "")}
            onClick={() => setArrestFilter("ALL")}
          >
            All Statuses
          </button>
          <button
            type="button"
            className={"cw-map-toggle-btn" + (arrestFilter === "ARREST" ? " cw-toggle-active" : "")}
            onClick={() => setArrestFilter("ARREST")}
          >
            Arrests Only
          </button>
          <button
            type="button"
            className={"cw-map-toggle-btn" + (arrestFilter === "NO_ARREST" ? " cw-toggle-active" : "")}
            onClick={() => setArrestFilter("NO_ARREST")}
          >
            No Arrest
          </button>
        </div>

        {/* OFFENSE CHIPS FILTER */}
        <div className="cw-map-chips-filter">
          <button
            type="button"
            className={"cw-map-filter-chip" + (categoryFilter === "ALL" ? " cw-chip-filter-active" : "")}
            onClick={() => setCategoryFilter("ALL")}
          >
            All Offenses ({locations.length})
          </button>
          {categories.map(([cat, cnt]) => (
            <button
              type="button"
              key={cat}
              className={"cw-map-filter-chip" + (categoryFilter === cat ? " cw-chip-filter-active" : "")}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat} ({cnt})
            </button>
          ))}
        </div>
      </div>

      {loadingLocations && (
        <div className="cw-full-card">
          <div className="ov-empty">Querying GPS coordinates and resolving spatial cluster…</div>
        </div>
      )}

      {!loadingLocations && locations.length === 0 && (
        <div className="cw-full-card">
          <div className="ov-news-unavailable">
            <div className="ov-news-symbol">!</div>
            <div>
              <strong>No coordinate points found</strong>
              <p>
                Geographic coordinates are currently unavailable for {selectedArea}.
                Try selecting a different area from the chips above.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loadingLocations && locations.length > 0 && (
        <div className="cw-full-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* MAP WRAPPER WITH FIXED HEIGHT */}
          <div className="cw-map-container-frame">
            <div className="cw-map-wrap">
              <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                {/* Standard OpenStreetMap tiles - No API key required */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={center} />

                {/* SCATTER MODE */}
                {viewMode === "scatter" &&
                  filteredLocations.map((d, i) => (
                    <CircleMarker
                      key={d.id || i}
                      center={[d.latitude, d.longitude]}
                      radius={d.arrest ? 6 : 5}
                      pathOptions={{
                        color: d.arrest ? "#E2574C" : "#60A5FA",
                        fillColor: d.arrest ? "#E2574C" : "#3B82F6",
                        fillOpacity: d.arrest ? 0.85 : 0.65,
                        weight: d.arrest ? 1.5 : 1,
                      }}
                    >
                      <Popup className="cw-dark-popup">
                        <div className="cw-popup-content">
                          <div className="cw-popup-tag">OFFENSE DETAIL</div>
                          <h4 className="cw-popup-title">{d.primary_type}</h4>
                          <div className="cw-popup-row">
                            <span>Outcome:</span>
                            <strong style={{ color: d.arrest ? "#E2574C" : "#A7A7AC" }}>
                              {d.arrest ? "Arrest Recorded" : "No Arrest Logged"}
                            </strong>
                          </div>
                          {d.description && (
                            <div className="cw-popup-desc">{d.description}</div>
                          )}
                          <div className="cw-popup-coords">
                            {d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}

                {/* HEATMAP DENSITY MODE */}
                {viewMode === "heatmap" &&
                  filteredLocations.map((d, i) => (
                    <CircleMarker
                      key={`heat-${d.id || i}`}
                      center={[d.latitude, d.longitude]}
                      radius={20}
                      pathOptions={{
                        stroke: false,
                        fillColor: d.arrest ? "#E2574C" : "#F59E0B",
                        fillOpacity: 0.18,
                      }}
                    />
                  ))}

                {viewMode === "heatmap" &&
                  filteredLocations.map((d, i) => (
                    <CircleMarker
                      key={`core-${d.id || i}`}
                      center={[d.latitude, d.longitude]}
                      radius={6}
                      pathOptions={{
                        stroke: true,
                        color: "#E2574C",
                        weight: 1,
                        fillColor: "#FFFFFF",
                        fillOpacity: 0.5,
                      }}
                    />
                  ))}
              </MapContainer>
            </div>

            {/* FLOATING LEGEND OVERLAY */}
            <div className="cw-map-legend-overlay">
              <div className="cw-legend-head">
                <span className="ov-status-dot" style={{ width: "5px", height: "5px" }} />
                <span>{viewMode === "heatmap" ? "HEAT INTENSITY" : "INCIDENT CLUSTERS"}</span>
              </div>
              <div className="cw-map-legend-items">
                {viewMode === "scatter" ? (
                  <>
                    <div className="cw-map-legend-item">
                      <span className="cw-map-dot cw-dot-arrest" />
                      <span>Arrest made ({arrestCount})</span>
                    </div>
                    <div className="cw-map-legend-item">
                      <span className="cw-map-dot cw-dot-no-arrest" />
                      <span>No arrest ({filteredLocations.length - arrestCount})</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cw-map-legend-item">
                      <span className="cw-map-dot" style={{ background: "#E2574C" }} />
                      <span>High Density Hotspot</span>
                    </div>
                    <div className="cw-map-legend-item">
                      <span className="cw-map-dot" style={{ background: "#F59E0B" }} />
                      <span>Moderate Cluster</span>
                    </div>
                  </>
                )}
              </div>
              <div className="cw-map-legend-tip">
                {viewMode === "scatter"
                  ? "Click any pin to inspect offense details"
                  : "Overlapping glows highlight high-risk corridors"}
              </div>
            </div>
          </div>

          {/* FOOTER BAR */}
          <div className="cw-map-footer-bar">
            <span>
              Plotted <strong>{filteredLocations.length}</strong> incident coordinates in {selectedArea}.
              {categoryFilter !== "ALL" && ` Filtered to "${categoryFilter}".`}
            </span>
            {setPage && (
              <button
                type="button"
                className="ov-refresh"
                onClick={() => setPage("types")}
              >
                Inspect Crime Types Breakdown →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
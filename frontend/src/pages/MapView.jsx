import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Recenters the map whenever the selected area's points change, since
// each Chicago community area sits in a different part of the city.
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapView({ selectedArea, loadingLocations, locations }) {
  const center = useMemo(() => {
    if (!locations.length) return [41.8781, -87.6298]; // Chicago city center fallback
    const avgLat = locations.reduce((s, d) => s + d.latitude, 0) / locations.length;
    const avgLng = locations.reduce((s, d) => s + d.longitude, 0) / locations.length;
    return [avgLat, avgLng];
  }, [locations]);

  return (
    <div className="cw-page-wrap">
      <div className="cw-full-card">
        <div className="cw-full-card-head">
          <div className="cw-full-card-title">
            Incident map — {selectedArea || "select an area"}
          </div>
          <div className="cw-full-card-sub">
            {locations.length} plotted · last 30 days · random sample, max 400
          </div>
        </div>

        {loadingLocations && (
          <div className="cw-state cw-state-dark">Loading locations…</div>
        )}

        {!loadingLocations && locations.length === 0 && (
          <div className="cw-news-empty">
            No coordinate data available for this area.
          </div>
        )}

        {!loadingLocations && locations.length > 0 && (
          <>
            <div className="cw-map-wrap">
              <MapContainer
                center={center}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={center} />
                {locations.map((d, i) => (
                  <CircleMarker
                    key={i}
                    center={[d.latitude, d.longitude]}
                    radius={6}
                    pathOptions={{
                      color: d.arrest ? "#E2574C" : "#200a69",
                      fillColor: d.arrest ? "#E2574C" : "#110967",
                      fillOpacity: 0.75,
                      weight: 1,
                    }}
                  >
                    <Popup>
                      <strong>{d.primary_type}</strong>
                      <br />
                      {d.arrest ? "Arrest made" : "No arrest"}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <div className="cw-map-legend">
              <div className="cw-map-legend-item">
                <span className="cw-map-dot" style={{ background: "#330766" }} />
                No arrest
              </div>
              <div className="cw-map-legend-item">
                <span className="cw-map-dot" style={{ background: "#E2574C" }} />
                Arrest made
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
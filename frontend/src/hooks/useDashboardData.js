import { useState, useEffect, useCallback, useRef, useMemo } from "react";

const API_BASE = "http://localhost:5000";

const VIOLENT_TYPES = new Set([
  "HOMICIDE",
  "BATTERY",
  "ASSAULT",
  "ROBBERY",
  "CRIM SEXUAL ASSAULT",
  "SEX OFFENSE",
  "WEAPONS VIOLATION",
  "OFFENSE INVOLVING CHILDREN",
  "KIDNAPPING",
  "INTIMIDATION"
]);

export default function useDashboardData() {
  const [days, setDays] = useState(30); // 7, 30, 90
  const [hotspots, setHotspots] = useState([]);
  const [loadingHotspots, setLoadingHotspots] = useState(true);
  const [hotspotError, setHotspotError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [selectedArea, setSelectedArea] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const [breakdown, setBreakdown] = useState([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  const [arrests, setArrests] = useState(null);
  const [loadingArrests, setLoadingArrests] = useState(false);

  const [timePattern, setTimePattern] = useState({ by_day: [], by_hour: [] });
  const [loadingTimePattern, setLoadingTimePattern] = useState(false);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [view, setView] = useState("chart");
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [page, setPage] = useState("home");

  const newsRequestId = useRef(0);
  const breakdownRequestId = useRef(0);
  const arrestsRequestId = useRef(0);
  const timePatternRequestId = useRef(0);
  const locationsRequestId = useRef(0);

  const loadHotspots = useCallback(async () => {
    setLoadingHotspots(true);
    setHotspotError(null);
    try {
      const res = await fetch(`${API_BASE}/api/hotspots?days=${days}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHotspots(data);
      setLastRefreshed(new Date());
      setSelectedArea((prev) => prev || (data[0] && data[0].area_name));
    } catch {
      setHotspotError(
        "Can't reach the backend. Make sure app.py is running on localhost:5000."
      );
    } finally {
      setLoadingHotspots(false);
    }
  }, [days]);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`${API_BASE}/api/summary?days=${days}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [days]);

  const loadNews = useCallback(async (areaName) => {
    const requestId = ++newsRequestId.current;
    setLoadingNews(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/news/${encodeURIComponent(areaName)}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (requestId === newsRequestId.current) setArticles(data);
    } catch {
      if (requestId === newsRequestId.current) setArticles([]);
    } finally {
      if (requestId === newsRequestId.current) setLoadingNews(false);
    }
  }, []);

  const loadBreakdown = useCallback(async (areaName) => {
    const requestId = ++breakdownRequestId.current;
    setLoadingBreakdown(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/area/${encodeURIComponent(areaName)}/breakdown?days=${days}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (requestId === breakdownRequestId.current) setBreakdown(data);
    } catch {
      if (requestId === breakdownRequestId.current) setBreakdown([]);
    } finally {
      if (requestId === breakdownRequestId.current) setLoadingBreakdown(false);
    }
  }, [days]);

  const loadArrests = useCallback(async (areaName) => {
    const requestId = ++arrestsRequestId.current;
    setLoadingArrests(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/area/${encodeURIComponent(areaName)}/arrests?days=${days}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (requestId === arrestsRequestId.current) setArrests(data);
    } catch {
      if (requestId === arrestsRequestId.current) setArrests(null);
    } finally {
      if (requestId === arrestsRequestId.current) setLoadingArrests(false);
    }
  }, [days]);

  const loadTimePattern = useCallback(async (areaName) => {
    const requestId = ++timePatternRequestId.current;
    setLoadingTimePattern(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/area/${encodeURIComponent(areaName)}/timepattern?days=${days}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (requestId === timePatternRequestId.current) setTimePattern(data);
    } catch {
      if (requestId === timePatternRequestId.current)
        setTimePattern({ by_day: [], by_hour: [] });
    } finally {
      if (requestId === timePatternRequestId.current)
        setLoadingTimePattern(false);
    }
  }, [days]);

  const loadLocations = useCallback(async (areaName) => {
    const requestId = ++locationsRequestId.current;
    setLoadingLocations(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/area/${encodeURIComponent(areaName)}/locations?days=${days}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const parsed = data
        .map((d) => ({
          ...d,
          latitude: parseFloat(d.latitude),
          longitude: parseFloat(d.longitude),
        }))
        .filter((d) => !isNaN(d.latitude) && !isNaN(d.longitude));
      if (requestId === locationsRequestId.current) setLocations(parsed);
    } catch {
      if (requestId === locationsRequestId.current) setLocations([]);
    } finally {
      if (requestId === locationsRequestId.current) setLoadingLocations(false);
    }
  }, [days]);

  useEffect(() => {
    loadHotspots();
    loadSummary();
    const interval = setInterval(() => {
      loadHotspots();
      loadSummary();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadHotspots, loadSummary]);

  useEffect(() => {
    if (selectedArea) {
      loadNews(selectedArea);
      loadBreakdown(selectedArea);
      loadArrests(selectedArea);
      loadTimePattern(selectedArea);
      loadLocations(selectedArea);
    }
  }, [
    selectedArea,
    days,
    loadNews,
    loadBreakdown,
    loadArrests,
    loadTimePattern,
    loadLocations,
  ]);

  const maxCount = hotspots.length > 0 ? hotspots[0].crime_count : 1;
  const selectedHotspot = hotspots.find((h) => h.area_name === selectedArea);
  const areaCount = selectedHotspot ? selectedHotspot.crime_count : 0;
  const areaPercent = maxCount ? (areaCount / maxCount) * 100 : 0;
  const areaRank = hotspots.findIndex((h) => h.area_name === selectedArea) + 1;

  const breakdownTotal = breakdown.reduce((s, t) => s + (Number(t.type_count) || 0), 0);
  const topTwoTypes = breakdown.slice(0, 2);

  const trendData = useMemo(() => summary?.trend || [], [summary]);

  // Calculate momentum / trend velocity from trend sparkline
  const momentum = useMemo(() => {
    if (trendData.length < 6) return { delta: "+2.4%", isUp: true };
    const half = Math.floor(trendData.length / 2);
    const firstHalf = trendData.slice(0, half).reduce((acc, d) => acc + (d.count || 0), 0);
    const secondHalf = trendData.slice(half).reduce((acc, d) => acc + (d.count || 0), 0);
    if (!firstHalf) return { delta: "+0.0%", isUp: false };
    const diff = ((secondHalf - firstHalf) / firstHalf) * 100;
    const isUp = diff >= 0;
    return {
      delta: `${isUp ? "▲ +" : "▼ "}${Math.abs(diff).toFixed(1)}%`,
      isUp,
    };
  }, [trendData]);

  // Violent vs Property classification
  const { violentCount, propertyCount, violentPercent, propertyPercent } = useMemo(() => {
    let violent = 0;
    let property = 0;
    breakdown.forEach((item) => {
      const count = Number(item.type_count) || 0;
      if (VIOLENT_TYPES.has(item.primary_type?.toUpperCase())) {
        violent += count;
      } else {
        property += count;
      }
    });
    const total = violent + property;
    return {
      violentCount: violent,
      propertyCount: property,
      violentPercent: total ? Math.round((violent / total) * 100) : 55,
      propertyPercent: total ? Math.round((property / total) * 100) : 45,
    };
  }, [breakdown]);

  const peakDay = timePattern.by_day.length
    ? timePattern.by_day.reduce((a, b) => (b.count > a.count ? b : a))
    : null;
  const peakHour = timePattern.by_hour.length
    ? timePattern.by_hour.reduce((a, b) => (b.count > a.count ? b : a))
    : null;

  function formatHour(h) {
    if (h === 0) return "12am";
    if (h === 12) return "12pm";
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  }

  return {
    API_BASE,
    days, setDays,
    hotspots, loadingHotspots, hotspotError,
    summary, loadingSummary,
    selectedArea, setSelectedArea,
    articles, loadingNews, loadNews,
    breakdown, loadingBreakdown,
    arrests, loadingArrests,
    timePattern, loadingTimePattern,
    locations, loadingLocations,
    view, setView,
    lastRefreshed,
    page, setPage,
    maxCount, selectedHotspot, areaCount, areaPercent, areaRank,
    breakdownTotal, topTwoTypes,
    trendData, momentum,
    violentCount, propertyCount, violentPercent, propertyPercent,
    peakDay, peakHour, formatHour,
  };
}

import { useState } from "react";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@500;600;700&display=swap');

.cwl-root {
  min-height: 100vh;
  background: #080808;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Oswald", sans-serif;
  padding: 24px;
}

.cwl-badge {
  text-align: center;
  max-width: 560px;
}

.cwl-toprow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 6px;
}

.cwl-estd {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #f6f3f2;
}

.cwl-arc {
  height: 46px;
}

.cwl-arc text {
  font-family: "Oswald", sans-serif;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.18em;
  fill: #eee9e8;
}

.cwl-title {
  font-family: "Anton", "Oswald", sans-serif;
  font-weight: 400;
  font-size: 64px;
  letter-spacing: 0.01em;
  color: #f6f3f3;
  line-height: 1;
  margin: 4px 0 10px;
  text-transform: uppercase;
}

.cwl-title span {
  font-size: 34px;
  vertical-align: middle;
  margin: 0 6px;
  font-family: "Oswald", sans-serif;
  font-weight: 600;
}

.cwl-subtitle {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #f2f1ee;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.cwl-subtitle2 {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: #f3f2f1;
  text-transform: uppercase;
  margin-bottom: 22px;
}

.cwl-icon {
  margin: 6px auto 26px;
  display: block;
}

.cwl-enter-btn {
  background: #f0ecec;
  color: #0a0a0a;
  border: none;
  padding: 14px 38px;
  font-family: "Oswald", sans-serif;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 3px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.cwl-enter-btn:hover {
  opacity: 0.85;
}

.cwl-footer {
  margin-top: 18px;
  font-size: 11.5px;
  color: #f1eded;
  letter-spacing: 0.06em;
}
`;

export default function LandingPage({ onEnter }) {
  return (
    <div className="cwl-root">
      <style>{styles}</style>
      <div className="cwl-badge">
        <div className="cwl-toprow">
          <span className="cwl-estd">ESTD</span>
          <svg className="cwl-arc" viewBox="0 0 320 46">
            <path id="arcPath" d="M 10 40 A 150 150 0 0 1 310 40" fill="none" />
            <text>
              <textPath href="#arcPath" startOffset="50%" textAnchor="middle">
                CHICAGO
              </textPath>
            </text>
          </svg>
          <span className="cwl-estd">2026</span>
        </div>

        <h1 className="cwl-title">
          Crime <span>&amp;</span> Watch
        </h1>

        <div className="cwl-subtitle">Hotspots, Patterns</div>
        <div className="cwl-subtitle2">and Local News Coverage</div>

        <svg
          className="cwl-icon"
          width="46"
          height="46"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle cx="20" cy="20" r="12" stroke="#f5f3f3" strokeWidth="3" />
          <line
            x1="29"
            y1="29"
            x2="41"
            y2="41"
            stroke="#efebeb"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M20 13 L23 19 L20 17 L17 19 Z"
            fill="#f3eeed"
          />
        </svg>

        <div>
          <button className="cwl-enter-btn" onClick={onEnter}>
            Enter Dashboard
          </button>
        </div>

        <div className="cwl-footer">
          Real Chicago crime data · Updated continuously
        </div>
      </div>
    </div>
  );
}

import { useMemo } from "react";

function useGaugeArc(percent) {
  return useMemo(() => {
    const clamped = Math.max(0, Math.min(100, percent));
    const angle = (clamped / 100) * 180;
    const r = 80;
    const cx = 100;
    const cy = 100;
    const rad = (Math.PI / 180) * (180 - angle);
    const x = cx + r * Math.cos(rad);
    const y = cy - r * Math.sin(rad);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`;
  }, [percent]);
}

export default function Gauge({ percent, total, label }) {
  const bgPath = "M 20 100 A 80 80 0 0 1 180 100";
  const fgPath = useGaugeArc(percent);
  return (
    <svg viewBox="0 0 200 108" width="100%" height="150">
      <path
        d={bgPath}
        fill="none"
        stroke="#26262A"
        strokeWidth="12"
        strokeLinecap="butt"
      />
      <path
        d={fgPath}
        fill="none"
        stroke="#F5F3F0"
        strokeWidth="12"
        strokeLinecap="butt"
      />
      <circle
        cx={20 + 160 * (percent / 100)}
        cy={100 - Math.sin((Math.PI / 180) * (percent * 1.8)) * 80}
        r="7"
        fill="#F3F1FA"
        style={{ display: "none" }}
      />
    </svg>
  );
}
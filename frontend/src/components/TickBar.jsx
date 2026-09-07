export default function TickBar({ percent }) {
  const total = 44;
  const filled = Math.round((percent / 100) * total);
  return (
    <div className="cw-tickbar">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={"cw-tick" + (i < filled ? " cw-tick-filled" : "")}
        />
      ))}
    </div>
  );
}

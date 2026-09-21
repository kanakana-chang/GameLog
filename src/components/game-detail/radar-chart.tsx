import type { GameAxis } from "./data";

const SIZE = 260;
const CX = 130;
const CY = 128;
const RADIUS = 72;

function polar(index: number, total: number, radius: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  };
}

export function EvalRadar({ axes }: { axes: GameAxis[] }) {
  const n = axes.length;
  const rings = [0.25, 0.5, 0.75, 1];
  const grid = rings.map((scale) =>
    axes
      .map((_, i) => {
        const p = polar(i, n, RADIUS * scale);
        return `${p.x},${p.y}`;
      })
      .join(" "),
  );
  const valuePoints = axes
    .map((axis, i) => {
      const p = polar(i, n, (axis.value / 100) * RADIUS);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto block"
      aria-hidden="true"
    >
      {grid.map((points) => (
        <polygon
          key={points}
          points={points}
          fill="none"
          stroke="#eef0f8"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const p = polar(i, n, RADIUS);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="#eef0f8"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={valuePoints}
        fill="rgba(255,107,53,0.13)"
        stroke="#ff6b35"
        strokeWidth={2}
      />
      {axes.map((axis, i) => {
        const p = polar(i, n, (axis.value / 100) * RADIUS);
        return <circle key={axis.key} cx={p.x} cy={p.y} r={3} fill="#ff6b35" />;
      })}
      {axes.map((axis, i) => {
        const p = polar(i, n, RADIUS + 16);
        return (
          <text
            key={`${axis.key}-label`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#5a6080"
            fontSize={9.5}
            fontFamily="var(--font-inter), sans-serif"
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}

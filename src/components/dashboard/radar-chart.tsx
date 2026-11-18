export type RadarAxis = {
  key: string;
  label: string;
  /** 0 = center, 1 = outer edge */
  value: number;
  /** Short figure shown under the label, e.g. "3rd" */
  figure: string;
  /** Hover text */
  detail: string;
};

const SIZE = 320;
const C = SIZE / 2;
const R = 108;
const LABEL_R = R + 22;
const INNER = 0.1; // keep last place off the exact center so the shape stays readable

const radius = (v: number) => R * (INNER + (1 - INNER) * v);
const angle = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
const point = (i: number, n: number, r: number) =>
  [C + r * Math.cos(angle(i, n)), C + r * Math.sin(angle(i, n))] as const;
const polygon = (n: number, r: (i: number) => number) =>
  Array.from({ length: n }, (_, i) => point(i, n, r(i)).join(",")).join(" ");

/**
 * Single-series spider chart. `rings` are fractions (0–1) drawn as recessive
 * guide polygons, e.g. tier boundaries.
 */
export function RadarChart({
  axes,
  rings,
  label,
}: {
  axes: RadarAxis[];
  rings: number[];
  label: string;
}) {
  const n = axes.length;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label} className="mx-auto block w-full max-w-[22rem] overflow-visible">
      {/* Grid */}
      <g className="fill-none stroke-(--grid-line)" strokeWidth="1">
        {[1, ...rings].map((f) => (
          <polygon key={f} points={polygon(n, () => radius(f))} className={f === 1 ? "stroke-border-strong" : undefined} />
        ))}
        {axes.map((a, i) => {
          const [x, y] = point(i, n, R);
          return <line key={a.key} x1={C} y1={C} x2={x} y2={y} />;
        })}
      </g>

      {/* Series */}
      <polygon
        points={polygon(n, (i) => radius(axes[i].value))}
        className="fill-(--accent)/15 stroke-(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Points + hover targets */}
      {axes.map((a, i) => {
        const [x, y] = point(i, n, radius(a.value));
        return (
          <g key={a.key} className="group cursor-default">
            <title>{a.detail}</title>
            <circle cx={x} cy={y} r="12" className="fill-transparent" />
            <circle
              cx={x}
              cy={y}
              r="4"
              strokeWidth="2"
              className="fill-(--accent) stroke-surface transition-[r] duration-150 group-hover:[r:6]"
            />
          </g>
        );
      })}

      {/* Axis labels */}
      {axes.map((a, i) => {
        const [x, y] = point(i, n, LABEL_R);
        const cos = Math.cos(angle(i, n));
        const anchor = Math.abs(cos) < 0.2 ? "middle" : cos > 0 ? "start" : "end";
        return (
          <text key={a.key} x={x} y={y} textAnchor={anchor} className="text-[11px]">
            <tspan x={x} dy="-0.15em" className="fill-fg-muted font-medium">{a.label}</tspan>
            <tspan x={x} dy="1.25em" className="fill-fg font-semibold">{a.figure}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

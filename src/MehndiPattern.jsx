function ring(cx, cy, orbit, count, radius, phase, filled) {
  return Array.from({ length: count }, (_, index) => {
    const angle = phase + (index / count) * Math.PI * 2;
    return (
      <circle
        key={`${orbit}-${radius}-${index}`}
        cx={cx + Math.cos(angle) * orbit}
        cy={cy + Math.sin(angle) * orbit}
        r={radius}
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
      />
    );
  });
}

function frame(inset, step, radius) {
  const left = inset;
  const right = 350 - inset;
  const top = inset;
  const bottom = 490 - inset;
  const marks = [];

  for (let x = left; x <= right; x += step) {
    marks.push([x, top], [x, bottom]);
  }
  for (let y = top + step; y < bottom; y += step) {
    marks.push([left, y], [right, y]);
  }

  return marks.map(([x, y], index) => (
    <circle
      key={`frame-${inset}-${index}`}
      cx={x}
      cy={y}
      r={index % 5 === 0 ? radius + 0.8 : radius}
      fill="currentColor"
      stroke="none"
    />
  ));
}

export default function MehndiPattern({ variant = 0, className = "dim" }) {
  const cx = 175;
  const cy = 196 + (variant % 3) * 8;
  const spin = (variant * 11 * Math.PI) / 180;

  return (
    <svg
      className={`mehndi ${className}`}
      viewBox="0 0 350 490"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <g strokeWidth="1.15">
        {frame(22, 13, 1.15)}
        {frame(34, 13, 0.7)}

        <circle cx={cx} cy={cy} r="132" />
        <circle cx={cx} cy={cy} r="124" strokeWidth="0.6" />
        <circle cx={cx} cy={cy} r="96" />
        <circle cx={cx} cy={cy} r="86" strokeWidth="0.6" />
        <circle cx={cx} cy={cy} r="58" />
        <circle cx={cx} cy={cy} r="34" />
        <circle cx={cx} cy={cy} r="14" fill="currentColor" stroke="none" />
        <circle cx={cx} cy={cy} r="5" fill="#1a1210" stroke="none" />

        {ring(cx, cy, 22, 8, 6.5, spin, false)}
        {ring(cx, cy, 46, 12, 8, spin, false)}
        {ring(cx, cy, 46, 12, 2.1, spin + Math.PI / 12, true)}
        {ring(cx, cy, 72, 18, 5.5, spin, false)}
        {ring(cx, cy, 72, 18, 1.5, spin + Math.PI / 18, true)}
        {ring(cx, cy, 110, 24, 7, spin + 0.08, false)}
        {ring(cx, cy, 110, 24, 1.7, spin, true)}
        {ring(cx, cy, 138, 32, 1.35, spin, true)}
        {ring(cx, cy, 148, 20, 2.4, spin + 0.2, true)}

        <circle cx={cx} cy={cy - 168} r="16" />
        <circle cx={cx} cy={cy - 168} r="7" />
        <circle cx={cx} cy={cy - 168} r="2.2" fill="currentColor" stroke="none" />
        {ring(cx, cy - 168, 24, 10, 2.2, spin, true)}

        <circle cx={cx - 118} cy={cy + 150} r="22" />
        <circle cx={cx - 118} cy={cy + 150} r="12" />
        <circle cx={cx - 118} cy={cy + 150} r="3" fill="currentColor" stroke="none" />
        {ring(cx - 118, cy + 150, 30, 12, 1.8, 0.4, true)}

        <circle cx={cx + 118} cy={cy + 150} r="22" />
        <circle cx={cx + 118} cy={cy + 150} r="12" />
        <circle cx={cx + 118} cy={cy + 150} r="3" fill="currentColor" stroke="none" />
        {ring(cx + 118, cy + 150, 30, 12, 1.8, 0.9, true)}
      </g>
    </svg>
  );
}

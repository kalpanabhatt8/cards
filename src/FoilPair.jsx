import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import flower from "./flower.svg?raw";
import stroke1 from "./stroke1.svg?raw";
import stroke2 from "./stroke2.svg?raw";
import sparkleTop from "./bgsparkle-top.svg?raw";
import sparkleBottom from "./bgsparkle-bottom.svg?raw";
import "./foil.css";

const FLOWER_WIDTH = 0.5;
const FLOWER_REFERENCE = 173;

function readViewBox(markup) {
  const match = markup.match(/viewBox="0 0\s+([\d.]+)\s+([\d.]+)"/);
  return { viewW: Number(match[1]), viewH: Number(match[2]) };
}

function flowerPiece(markup, className) {
  const box = readViewBox(markup);
  return {
    markup,
    className,
    viewW: box.viewW,
    viewH: box.viewH,
    width: FLOWER_WIDTH * (box.viewW / FLOWER_REFERENCE),
  };
}

const pieces = [
  { markup: stroke2, className: "frame" },
  { markup: stroke1, className: "inner" },
  { markup: sparkleTop, className: "sparkle-top" },
  { markup: sparkleBottom, className: "sparkle-bottom" },
  flowerPiece(flower, "flower"),
];

function scopeMarkup(markup, scope) {
  return markup
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${scope}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${scope}-${id})`);
}

const CARD_W = 250.7;
const CARD_H = 350.358;
const INK = { dark: "#6a5a42", light: "#9a7840" };
const MARK_TOP_Y = CARD_H * (0.5 - 328 / 372.358 / 2 + 0.062);
const MARK_BOTTOM_Y = CARD_H * (1 - (0.5 - 328 / 390.358 / 2 + 0.042));
const MARK_BACK_Y = CARD_H / 2;

function markMarkup(text, fontSize, y, tracking) {
  return `<svg viewBox="0 0 ${CARD_W} ${CARD_H}" xmlns="http://www.w3.org/2000/svg"><text class="mark-text" x="${CARD_W / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" letter-spacing="${tracking}" fill="#5E5E5E" style="font-family:Gloock,Georgia,serif">${text}</text></svg>`;
}

function wrappedMarkMarkup(lines, fontSize, centerY, tracking, lineGap = fontSize * 1.2) {
  const startY = centerY - ((lines.length - 1) * lineGap) / 2;
  const tspans = lines
    .map((line, i) => `<tspan x="${CARD_W / 2}"${i ? ` dy="${lineGap}"` : ""}>${line}</tspan>`)
    .join("");
  return `<svg viewBox="0 0 ${CARD_W} ${CARD_H}" xmlns="http://www.w3.org/2000/svg"><text class="mark-text" y="${startY}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" letter-spacing="${tracking}" fill="#5E5E5E" style="font-family:Gloock,Georgia,serif">${tspans}</text></svg>`;
}

const marks = [
  { markup: markMarkup("888", 12, MARK_TOP_Y, "0.08em"), className: "mark-top", viewW: CARD_W, viewH: CARD_H, width: 1 },
  { markup: markMarkup("October 2026", 9, MARK_BOTTOM_Y, "0.1em"), className: "mark-bottom", viewW: CARD_W, viewH: CARD_H, width: 1 },
];

const backMarks = [
  { markup: stroke2, className: "frame" },
  { markup: stroke1, className: "inner" },
  {
    markup: wrappedMarkMarkup(["sending u good", "vibes &lt;3"], 20, MARK_BACK_Y, "0.03em"),
    className: "mark-back",
    viewW: CARD_W,
    viewH: CARD_H,
    width: 1,
  },
];

const layouts = {
  frame: {
    left: (CARD_W - 243) / 2,
    top: (CARD_H - 338) / 2,
    sx: 1,
    sy: 1,
  },
  inner: {
    left: (CARD_W - 233) / 2,
    top: (CARD_H - 328) / 2,
    sx: 236 / 233,
    sy: 1,
  },
  "sparkle-top": {
    left: (CARD_W - 224) / 2,
    top: (0.5 - 328 / 362.358 / 2) * CARD_H,
    sx: 1,
    sy: 1,
  },
  "sparkle-bottom": {
    left: (CARD_W - 224) / 2,
    top: (CARD_H + 328) / 2 - 39,
    sx: 1,
    sy: 1,
  },
};

for (const piece of [...pieces, ...marks, ...backMarks]) {
  if (!piece.viewW) continue;
  const w = CARD_W * piece.width;
  const h = w * (piece.viewH / piece.viewW);
  layouts[piece.className] = {
    left: (CARD_W - w) / 2,
    top: (CARD_H - h) / 2,
    sx: piece.viewW / w,
    sy: piece.viewH / h,
  };
}

function toSvg(name, cardX, cardY) {
  const box = layouts[name];
  return {
    x: (cardX - box.left) * box.sx,
    y: (cardY - box.top) * box.sy,
  };
}

function buildStops(t, gold) {
  const band = [
    [t - 0.1, gold],
    [t - 0.02, "#f0d48a"],
    [t + 0.03, "#e8a15a"],
    [t + 0.1, gold],
  ];
  const stops = [{ offset: 0, color: gold }];
  for (const [offset, color] of band) {
    const next = Math.min(0.996, Math.max(stops[stops.length - 1].offset + 0.004, offset));
    if (next >= 0.996) break;
    stops.push({ offset: next, color });
  }
  stops.push({ offset: 1, color: gold });
  return stops;
}

function svgEl(name, attrs, parent) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  parent.appendChild(node);
  return node;
}

const FLOWER_STOPS = [
  [0, "#3ed4c6"],
  [0.12, "#6ed48a"],
  [0.3, "#ffe566"],
  [0.46, "#ffc247"],
  [0.62, "#ff8c2a"],
  [0.78, "#ff5f92"],
  [1, "#ffb07a"],
];

const MARK_ACCENTS = {
  green: "#9bb892",
  pink: "#c89aa4",
  warm: "#c9a078",
};

function markAccent(px, py) {
  if (px < -0.12) return MARK_ACCENTS.green;
  if (px > 0.12) return MARK_ACCENTS.pink;
  if (py > 0.1) return MARK_ACCENTS.warm;
  return MARK_ACCENTS.pink;
}

function buildMarkStops(t, gold, accent) {
  const band = [
    [t - 0.16, gold],
    [t - 0.05, "#c9a86a"],
    [t + 0.02, accent],
    [t + 0.1, "#c9a86a"],
    [t + 0.18, gold],
  ];
  const stops = [{ offset: 0, color: gold }];
  for (const [offset, color] of band) {
    const next = Math.min(0.996, Math.max(stops[stops.length - 1].offset + 0.004, offset));
    if (next >= 0.996) break;
    stops.push({ offset: next, color });
  }
  stops.push({ offset: 1, color: gold });
  return stops;
}

function useColorTone() {
  const [tone, setTone] = useState("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = tone;
  }, [tone]);

  return [tone, setTone];
}

const FRONT_Y = -14;
const BACK_Y = 166;

function FoilCard({ tone }) {
  const reduce = Boolean(useReducedMotion());
  const stageRef = useRef(null);
  const drag = useRef(null);
  const flipped = useRef(false);
  const flipAnim = useRef(null);
  const [fontTick, setFontTick] = useState(0);
  const tiltX = useMotionValue(reduce ? 0 : 8);
  const spinY = useMotionValue(reduce ? 0 : FRONT_Y);
  const lift = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 110, damping: 16, mass: 0.7 });
  const springZ = useSpring(lift, { stiffness: 280, damping: 24, mass: 0.72 });

  // Back face is hidden at first paint; remount marks once Gloock is ready.
  useEffect(() => {
    let alive = true;
    const mark = () => {
      if (alive) setFontTick((n) => n + 1);
    };
    if (document.fonts?.check?.("12px Gloock")) mark();
    document.fonts?.load?.("400 12px Gloock").then(mark).catch(() => {});
    document.fonts?.ready?.then(mark).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const ns = "http://www.w3.org/2000/svg";
    const gradients = new Map();

    stage.querySelectorAll(".art-shine .art-svg").forEach((wrap) => {
      const name = [...wrap.classList].find((item) => item !== "art-svg");
      const svg = wrap.querySelector("svg");
      if (!name || !svg || gradients.has(name)) return;
      const id = `sheen-${tone}-${name}`;
      let gradient = svg.querySelector(`#${id}`);
      const defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(ns, "defs"), svg.firstChild);
      if (name === "flower") {
        gradient?.remove();
        gradient = svgEl("linearGradient", { id, gradientUnits: "userSpaceOnUse" }, defs);
        FLOWER_STOPS.forEach(([offset, color]) => {
          svgEl("stop", { offset: `${offset * 100}%`, "stop-color": color }, gradient);
        });
      } else if (!gradient || gradient.querySelectorAll("stop").length !== 12) {
        gradient?.remove();
        gradient = document.createElementNS(ns, "linearGradient");
        gradient.id = id;
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        for (let index = 0; index < 12; index += 1) {
          gradient.appendChild(document.createElementNS(ns, "stop"));
        }
        defs.appendChild(gradient);
      }
      gradients.set(name, gradient);
    });

    const paint = (px, py) => {
      const dist = Math.min(1, Math.hypot(px, py) / 0.16);
      stage.style.setProperty("--sheen", dist.toFixed(3));
      stage.classList.toggle("is-live", dist > 0.04);
      const t = Math.min(0.78, Math.max(0.22, 0.5 + px * 0.45 + py * 0.32));
      const frameStops = buildStops(t, INK[tone]);
      const softStops = buildMarkStops(t, INK[tone], markAccent(px, py));
      gradients.forEach((gradient, name) => {
        if (name === "flower") {
          const box = gradient.ownerSVGElement.viewBox.baseVal;
          const angle = Math.atan2(0.28 + py * 0.9, 1 + px * 0.9);
          const cx = box.width / 2;
          const cy = box.height / 2;
          const reach = box.width * 0.62;
          const slide = (px * 0.22 + py * 0.16) * box.width;
          const dx = Math.cos(angle);
          const dy = Math.sin(angle);
          gradient.setAttribute("x1", (cx - dx * reach + dx * slide).toFixed(2));
          gradient.setAttribute("y1", (cy - dy * reach + dy * slide).toFixed(2));
          gradient.setAttribute("x2", (cx + dx * reach + dx * slide).toFixed(2));
          gradient.setAttribute("y2", (cy + dy * reach + dy * slide).toFixed(2));
          return;
        }

        const isMark = name === "mark-top" || name === "mark-bottom" || name === "mark-back";
        if (isMark) {
          const cx = CARD_W / 2;
          const cy = name === "mark-top" ? MARK_TOP_Y : name === "mark-bottom" ? MARK_BOTTOM_Y : MARK_BACK_Y;
          const reach = name === "mark-top" ? 34 : name === "mark-back" ? 110 : 64;
          const slide = px * reach * 0.35;
          gradient.setAttribute("x1", (cx - reach + slide).toFixed(2));
          gradient.setAttribute("y1", cy.toFixed(2));
          gradient.setAttribute("x2", (cx + reach + slide).toFixed(2));
          gradient.setAttribute("y2", cy.toFixed(2));
          const nodes = gradient.querySelectorAll("stop");
          nodes.forEach((node, index) => {
            const stop = softStops[Math.min(index, softStops.length - 1)];
            node.setAttribute("offset", `${(stop.offset * 100).toFixed(2)}%`);
            node.setAttribute("stop-color", stop.color);
          });
          return;
        }

        const from = toSvg(name, -30, -20);
        const to = toSvg(name, CARD_W + 30, CARD_H + 10);
        gradient.setAttribute("x1", from.x.toFixed(2));
        gradient.setAttribute("y1", from.y.toFixed(2));
        gradient.setAttribute("x2", to.x.toFixed(2));
        gradient.setAttribute("y2", to.y.toFixed(2));
        const nodes = gradient.querySelectorAll("stop");
        nodes.forEach((node, index) => {
          const stop = frameStops[Math.min(index, frameStops.length - 1)];
          node.setAttribute("offset", `${(stop.offset * 100).toFixed(2)}%`);
          node.setAttribute("stop-color", stop.color);
        });
      });
    };

    stage.__paintSheen = paint;
    return () => {
      delete stage.__paintSheen;
    };
  }, [reduce, tone, fontTick]);

  function restY() {
    return flipped.current ? BACK_Y : FRONT_Y;
  }

  function settleY(targetY, toBack) {
    flipped.current = toBack;
    flipAnim.current?.stop();
    flipAnim.current = animate(spinY, targetY, {
      type: "spring",
      stiffness: 90,
      damping: 20,
      mass: 1.1,
      restDelta: 0.35,
      restSpeed: 0.35,
      onComplete: () => {
        spinY.jump(restY());
        flipAnim.current = null;
      },
    });
  }

  function onPointerMove(event) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    if (drag.current) {
      const dx = event.clientX - drag.current.x;
      drag.current.dx = dx;
      if (Math.abs(dx) > 6) drag.current.dir = Math.sign(dx);
      const dir = drag.current.dir || 1;
      const progress = Math.max(0, Math.min(1, Math.abs(dx) / 240));
      drag.current.maxProgress = Math.max(drag.current.maxProgress || 0, progress);
      spinY.set(drag.current.baseY + dir * 180 * progress);
      stage.__paintSheen?.(px * 0.4, py * 0.4);
      return;
    }

    // Hover: light 3D tilt + foil sheen (not while flipping).
    if (!reduce && !flipAnim.current) {
      tiltX.set(8 - py * 22);
      spinY.set(restY() + px * 22);
      stage.__paintSheen?.(px, py);
      return;
    }
    if (!flipAnim.current) stage.__paintSheen?.(px, py);
  }

  function onPointerLeave(event) {
    if (event.buttons || drag.current || flipAnim.current) return;
    lift.set(0);
    stageRef.current?.classList.remove("is-live");
    stageRef.current?.style.setProperty("--sheen", "0");
    if (!reduce) {
      tiltX.set(8);
      spinY.set(restY());
    }
  }

  function finishDrag(commit) {
    if (!drag.current) return;
    const dx = drag.current.dx || 0;
    const dir = drag.current.dir || (dx === 0 ? 1 : Math.sign(dx));
    const baseY = drag.current.baseY;
    const progress = Math.max(Math.abs(dx) / 240, drag.current.maxProgress || 0);
    drag.current = null;
    lift.set(0);
    if (!reduce) tiltX.set(8);

    if (!commit || progress < 0.5) {
      settleY(baseY, flipped.current);
      return;
    }

    // Past halfway: finish the turn in the drag direction.
    settleY(baseY + dir * 180, !flipped.current);
  }

  return (
    <div
      className={`foil-stage foil-stage--${tone}`}
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={(event) => {
        if (flipAnim.current) {
          flipAnim.current.stop();
          flipAnim.current = null;
          spinY.jump(restY());
        }
        drag.current = {
          x: event.clientX,
          dx: 0,
          dir: 0,
          maxProgress: 0,
          baseY: flipped.current ? BACK_Y : FRONT_Y,
        };
        spinY.set(drag.current.baseY);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        lift.set(48);
        onPointerMove(event);
      }}
      onPointerUp={() => finishDrag(true)}
      onPointerCancel={() => finishDrag(false)}
    >
      <motion.article
        className={`foil-card foil-card--${tone}`}
        style={{ rotateX: springX, rotateY: spinY, z: springZ }}
      >
        <div className="foil-face foil-face--front">
          <div className="art-layer">
            {[...pieces, ...marks].map((piece) => (
              <div
                key={`${piece.className}-${fontTick}`}
                className={`art-svg ${piece.className}`}
                style={piece.viewW ? { width: `${piece.width * 100}%`, aspectRatio: `${piece.viewW} / ${piece.viewH}` } : undefined}
                dangerouslySetInnerHTML={{ __html: scopeMarkup(piece.markup, `${tone}-base`) }}
              />
            ))}
          </div>
          <div className="art-shine" aria-hidden="true">
            {[...pieces, ...marks].map((piece) => (
              <div
                key={`shine-${piece.className}-${fontTick}`}
                className={`art-svg ${piece.className}`}
                style={piece.viewW ? { width: `${piece.width * 100}%`, aspectRatio: `${piece.viewW} / ${piece.viewH}` } : undefined}
                dangerouslySetInnerHTML={{ __html: scopeMarkup(piece.markup, `${tone}-shine`) }}
              />
            ))}
          </div>
        </div>
        <div className="foil-face foil-face--back" aria-hidden="true">
          <div className="art-layer">
            {backMarks.map((piece) => (
              <div
                key={`${piece.className}-${fontTick}`}
                className={`art-svg ${piece.className}`}
                style={piece.viewW ? { width: `${piece.width * 100}%`, aspectRatio: `${piece.viewW} / ${piece.viewH}` } : undefined}
                dangerouslySetInnerHTML={{ __html: scopeMarkup(piece.markup, `${tone}-back-base-${fontTick}`) }}
              />
            ))}
          </div>
          <div className="art-shine" aria-hidden="true">
            {backMarks.map((piece) => (
              <div
                key={`shine-${piece.className}-${fontTick}`}
                className={`art-svg ${piece.className}`}
                style={piece.viewW ? { width: `${piece.width * 100}%`, aspectRatio: `${piece.viewW} / ${piece.viewH}` } : undefined}
                dangerouslySetInnerHTML={{ __html: scopeMarkup(piece.markup, `${tone}-back-shine-${fontTick}`) }}
              />
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.8 3.2a8.8 8.8 0 1 0 6 15.2 7.2 7.2 0 0 1-6-15.2Z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        fill="currentColor"
        d="M11 1.5h2v3.2h-2zm0 17.8h2v3.2h-2zM1.5 11h3.2v2H1.5zm17.8 0h3.2v2h-3.2zM4.4 3.7l2.3 2.3-1.4 1.4-2.3-2.3zm14.3 14.3 2.3 2.3-1.4 1.4-2.3-2.3zM18.9 3.7l1.4 1.4-2.3 2.3-1.4-1.4zM5.3 18l1.4 1.4-2.3 2.3-1.4-1.4z"
      />
    </svg>
  );
}

export default function FoilPair() {
  const [tone, setTone] = useColorTone();
  const nextTone = tone === "dark" ? "light" : "dark";
  return (
    <div className="foil-pair">
      <button
        type="button"
        className="theme-switch"
        aria-label={`Switch to ${nextTone} mode`}
        onClick={() => setTone(nextTone)}
      >
        {tone === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
      <FoilCard tone={tone} />
    </div>
  );
}

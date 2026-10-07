import { useEffect, useMemo, useRef } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cards } from "./cards.js";
import MehndiPattern from "./MehndiPattern.jsx";

const VISIBLE = 4;

const spring = { type: "spring", stiffness: 280, damping: 30, mass: 0.82 };

function mod(value, count) {
  return ((value % count) + count) % count;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export default function CardDeck({ index, onChange }) {
  const reduce = Boolean(useReducedMotion());
  const stageRef = useRef(null);
  const lockRef = useRef(false);

  const tiltX = useMotionValue(reduce ? 0 : 9);
  const tiltY = useMotionValue(reduce ? 0 : -16);
  const springX = useSpring(tiltX, { stiffness: 110, damping: 16, mass: 0.7 });
  const springY = useSpring(tiltY, { stiffness: 110, damping: 16, mass: 0.7 });
  const shadowX = useTransform(springY, [-34, 10], [30, -24]);
  const shadowScale = useTransform(springX, [-4, 24], [1.05, 0.9]);

  const variants = useMemo(() => buildVariants(reduce), [reduce]);

  const slots = Array.from({ length: VISIBLE }, (_, offset) => ({
    offset,
    card: cards[mod(index + offset, cards.length)],
  }));

  function flick(indexDir, throwDir = indexDir) {
    if (lockRef.current) return;
    lockRef.current = true;
    directionHolder.current = indexDir;
    throwHolder.current = throwDir;
    onChange(mod(index + indexDir, cards.length));
    window.setTimeout(() => {
      lockRef.current = false;
    }, reduce ? 0 : 780);
  }

  useEffect(() => {
    function onKey(event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      if (event.key === "ArrowRight") flick(1, -1);
      else flick(-1, 1);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onChange, reduce]);

  function onPointerMove(event) {
    if (reduce || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(9 - py * 20);
    tiltY.set(-16 + px * 28);
    stageRef.current.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    stageRef.current.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  }

  function onPointerLeave(event) {
    if (reduce || event.buttons) return;
    tiltX.set(9);
    tiltY.set(-16);
    stageRef.current?.style.setProperty("--gx", "30%");
    stageRef.current?.style.setProperty("--gy", "16%");
  }

  return (
    <section className="deck-column" aria-label="Photograph deck">
      <div
        className="stage"
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <motion.div
          className="ground"
          style={{ x: shadowX, scale: shadowScale }}
          aria-hidden="true"
        />
        <motion.div
          className="rig"
          style={{ rotateX: springX, rotateY: springY }}
          aria-hidden="true"
        >
          <AnimatePresence initial={false}>
            {slots.map(({ card, offset }) => (
              <PhotoCard
                key={card.id}
                card={card}
                offset={offset}
                active={offset === 0}
                reduce={reduce}
                variants={variants}
                onFlick={flick}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="controls">
        <button type="button" onClick={() => flick(-1, 1)}>
          Previous
        </button>
        <p className="count">
          <span>{pad(index + 1)}</span>
          <span className="count-rule" aria-hidden="true" />
          <span>{pad(cards.length)}</span>
        </p>
        <button type="button" onClick={() => flick(1, -1)}>
          Next
        </button>
      </div>
    </section>
  );
}

function PhotoCard({ card, offset, active, reduce, variants, onFlick }) {
  const dragX = useMotionValue(0);
  const dragRotateY = useSpring(useTransform(dragX, [-260, 260], [26, -26]), {
    stiffness: 280,
    damping: 24,
  });
  const dragRotateZ = useSpring(useTransform(dragX, [-260, 260], [-7, 7]), {
    stiffness: 280,
    damping: 24,
  });
  const dragLift = useSpring(
    useTransform(dragX, (value) => Math.min(56, Math.abs(value) * 0.22)),
    { stiffness: 280, damping: 26 },
  );
  const dragged = useRef(false);

  useEffect(() => {
    if (!active) dragX.set(0);
  }, [active, dragX]);

  return (
    <motion.article
      className="card"
      variants={variants}
      custom={{ offset }}
      initial="enter"
      animate="present"
      exit="leave"
      style={{ pointerEvents: active ? "auto" : "none" }}
    >
      <motion.div
        className="slab"
        data-active={active}
        style={{
          x: active ? dragX : 0,
          rotateY: active && !reduce ? dragRotateY : 0,
          rotateZ: active && !reduce ? dragRotateZ : 0,
          z: active && !reduce ? dragLift : 0,
        }}
        variants={{ enter: {}, present: {}, leave: {} }}
        drag={active && !reduce ? "x" : false}
        dragMomentum={false}
        dragElastic={0.16}
        dragConstraints={{ left: -300, right: 300 }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          const toRight = info.offset.x > 72 || info.velocity.x > 650;
          const toLeft = info.offset.x < -72 || info.velocity.x < -650;
          if (toRight || toLeft) {
            onFlick(1, toRight ? 1 : -1);
            return;
          }
          animate(dragX, 0, { type: "spring", stiffness: 340, damping: 30 });
        }}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          onFlick(1, -1);
        }}
      >
        <div className="face front">
          <div className="sheet">
            <MehndiPattern variant={card.motif} className="dim" />
            <MehndiPattern variant={card.motif} className="lit" />
            {active ? (
              <div className="caption">
                <h2>{card.title}</h2>
                <p>{card.place}</p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="face back" aria-hidden="true">
          <div className="sheet">
            <MehndiPattern variant={card.motif} />
          </div>
        </div>
        <span className="edge top" />
        <span className="edge bottom" />
      </motion.div>
    </motion.article>
  );
}

function buildVariants(reduce) {
  if (reduce) {
    return {
      enter: () => ({ opacity: 0 }),
      present: ({ offset }) => ({
        opacity: offset === 0 ? 1 : 0,
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
        zIndex: 10 - offset,
      }),
      leave: () => ({ opacity: 0, transition: { duration: 0.15 } }),
    };
  }

  return {
    enter: ({ offset }) => {
      if (directionRefValue() < 0 && offset === 0) {
        const sign = throwRefValue();
        return {
          x: sign * 460,
          y: -24,
          z: 130,
          rotateY: sign * -62,
          rotateZ: sign * 12,
          scale: 0.98,
          opacity: 0,
          zIndex: 40,
        };
      }

      return {
        x: 0,
        y: -78,
        z: -220,
        rotateY: 0,
        rotateZ: 0,
        scale: 0.9,
        opacity: 0,
        zIndex: 0,
      };
    },
    present: ({ offset }) => ({
      x: 0,
      y: -offset * 15,
      z: -offset * 20,
      rotateY: 0,
      rotateZ: 0,
      scale: 1 - offset * 0.025,
      opacity: 1,
      zIndex: 12 - offset,
      transition: spring,
    }),
    leave: ({ offset }) => {
      if (directionRefValue() >= 0 && offset === 0) {
        const sign = throwRefValue();
        return {
          x: [0, sign * 28, sign * 190],
          y: [0, -72, -8],
          z: [0, 160, 28],
          rotateY: [0, sign * -70, sign * -86],
          rotateZ: [0, sign * 5, sign * 12],
          scale: [1, 1.03, 0.97],
          opacity: [1, 1, 0],
          zIndex: 40,
          transition: {
            duration: 0.74,
            ease: "easeInOut",
            times: [0, 0.42, 1],
          },
        };
      }

      return {
        y: -96,
        z: -260,
        scale: 0.86,
        opacity: 0,
        zIndex: 0,
        transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
      };
    },
  };
}

function directionRefValue() {
  return directionHolder.current;
}

function throwRefValue() {
  return throwHolder.current;
}

const directionHolder = { current: 1 };
const throwHolder = { current: 1 };

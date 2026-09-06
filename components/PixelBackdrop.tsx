// Purely decorative scattered pixel dots / cut-corner motif, matching the
// SCAA WeChat visual system: black background, sparse white pixel texture.
const DOTS = [
  [3, 6], [6, 14], [12, 40], [4, 62], [9, 88], [18, 22], [22, 70], [30, 12],
  [35, 55], [42, 90], [48, 8], [55, 32], [60, 66], [66, 18], [72, 48],
  [78, 82], [84, 10], [88, 60], [92, 30], [95, 76],
];

export default function PixelBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {DOTS.map(([top, left], i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${top}%`,
            left: `${left}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            background: "rgba(255,255,255,0.35)",
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

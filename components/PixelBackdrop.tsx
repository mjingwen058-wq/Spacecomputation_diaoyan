// Purely decorative scattered pixel dots / cut-corner motif, matching the
// SCAA WeChat visual system: black background, sparse white pixel texture.
const DOTS = [
  [3, 6], [6, 14], [12, 40], [4, 62], [9, 88], [18, 22], [22, 70], [30, 12],
  [35, 55], [42, 90], [48, 8], [55, 32], [60, 66], [66, 18], [72, 48],
  [78, 82], [84, 10], [88, 60], [92, 30], [95, 76],
  [15, 55], [26, 85], [38, 30], [50, 65], [62, 5], [70, 92], [80, 38],
  [90, 15], [8, 30], [45, 45],
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
            width: i % 3 === 0 ? 6 : 4,
            height: i % 3 === 0 ? 6 : 4,
            background: "#ffffff",
            opacity: i % 3 === 0 ? 0.5 : 0.32,
          }}
        />
      ))}
    </div>
  );
}

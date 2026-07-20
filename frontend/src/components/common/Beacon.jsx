/**
 * Beacon — the signature visual motif of ReConnect AI.
 * Concentric rings pulsing outward from a fixed point represent
 * the AI continuously scanning records for a match, rather than
 * waiting for someone to search manually.
 *
 * Purely CSS-driven (see tailwind.config.js "pulse-ring" keyframe)
 * so it respects prefers-reduced-motion globally via index.css.
 */
export default function Beacon({ size = 320 }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute rounded-full border border-signal/60 animate-pulse-ring"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            animationDelay: `${i * 1}s`,
          }}
        />
      ))}
      <div className="absolute w-3 h-3 rounded-full bg-signal shadow-[0_0_0_6px_rgba(224,164,88,0.18)]" />

      {/* Orbiting record cards — quiet, not competing with the pulse */}
      <div
        className="absolute rounded-2xl bg-paper border border-line shadow-soft px-4 py-3 font-mono text-[11px] text-ink-soft"
        style={{ top: '8%', left: '4%' }}
      >
        case #4471<br />
        <span className="text-verified">match 92%</span>
      </div>
      <div
        className="absolute rounded-2xl bg-paper border border-line shadow-soft px-4 py-3 font-mono text-[11px] text-ink-soft"
        style={{ bottom: '10%', right: '2%' }}
      >
        region: NCR-07<br />
        status: verifying
      </div>
    </div>
  );
}

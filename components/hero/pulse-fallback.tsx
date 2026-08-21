export function PulseFallback() {
  const bars = Array.from({ length: 24 });
  return (
    <div className="relative flex h-full w-full items-center justify-center" aria-hidden>
      <div className="absolute h-64 w-64 rounded-full bg-signal/10 blur-3xl animate-floatSlow" />
      <div className="absolute h-48 w-48 rounded-full bg-pulse/10 blur-3xl animate-floatSlow" style={{ animationDelay: '1.5s' }} />
      <div className="relative flex items-end gap-1.5">
        {bars.map((_, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-signal to-pulse motion-safe:animate-pulseBar"
            style={{
              height: `${28 + Math.abs(Math.sin(i)) * 60}px`,
              animationDelay: `${i * 0.06}s`,
              animationDuration: `${1 + (i % 5) * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

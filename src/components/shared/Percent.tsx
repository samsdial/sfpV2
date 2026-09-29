export function Percent({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 1000) / 10;
  return (
    <span className={className}>
      {pct.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %
    </span>
  );
}

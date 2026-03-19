interface Props {
  title: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "profit" | "loss" | "warning";
}

export function KpiCard({ title, value, subtitle, variant = "default" }: Props) {
  const colorClass = {
    default: "text-foreground",
    profit: "text-profit",
    loss: "text-loss",
    warning: "text-warning",
  }[variant];

  return (
    <div className="rounded-lg bg-card border border-border p-4 animate-fade-in">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

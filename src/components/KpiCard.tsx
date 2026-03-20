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

  const accentClass = {
    default: "border-border",
    profit: "border-profit/40",
    loss: "border-loss/40",
    warning: "border-warning/40",
  }[variant];

  return (
    <div className={`h-full min-h-[138px] rounded-lg bg-card border ${accentClass} p-4 animate-fade-in shadow-sm flex flex-col justify-between`}>
      <p className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-2">{title}</p>
      <p className={`text-2xl md:text-[1.65rem] leading-tight font-bold font-mono ${colorClass}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

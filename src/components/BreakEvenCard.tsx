import type { BreakEvenDetails } from "@/lib/simulation";

const fmt = (v: number) =>
  v >= 1000000
    ? `R$ ${(v / 1000000).toFixed(1)}M`
    : v >= 1000
      ? `R$ ${(v / 1000).toFixed(1)}k`
      : `R$ ${v.toFixed(0)}`;

interface Props {
  details: BreakEvenDetails | null;
}

export function BreakEvenCard({ details }: Props) {
  if (!details) {
    return (
      <div className="col-span-full rounded-lg border border-destructive/30 bg-card p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-destructive">
            Break-even não atingido
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Dentro do horizonte configurado, o modelo não consegue sair do prejuízo. 
          Tente aumentar o crescimento, reduzir o CAC ou ajustar o fator de crédito (α).
        </p>
      </div>
    );
  }

  const rows = [
    { label: "Mês", value: `Mês ${details.month}` },
    { label: "Clientes necessários", value: details.customers.toLocaleString("pt-BR") },
    { label: "Receita no mês", value: fmt(details.revenue) },
    { label: "Custo total no mês", value: fmt(details.totalCost) },
    { label: "Margem do varejista", value: `${details.marginPct.toFixed(2)}%` },
    { label: "Margem por cliente", value: fmt(details.marginPerClient) },
    { label: "Prejuízo acumulado até aqui", value: fmt(Math.abs(details.cumulativeLoss)) },
  ];

  return (
    <div className="col-span-full rounded-lg border border-profit/30 bg-card p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-profit" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-profit">
          🎯 O jogo virou — Break-even
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="text-base font-bold font-mono text-foreground">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

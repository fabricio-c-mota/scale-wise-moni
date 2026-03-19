import type { BreakEvenDetails } from "@/lib/simulation";
import { KpiCard } from "./KpiCard";

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

  return (
    <>
      <div className="col-span-full">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-profit" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-profit">
            O jogo virou — Break-even
          </h3>
        </div>
      </div>
      <KpiCard title="Mês do Break-even" value={`Mês ${details.month}`} variant="profit" />
      <KpiCard title="Clientes necessários" value={details.customers.toLocaleString("pt-BR")} variant="profit" />
      <KpiCard title="Receita no mês" value={fmt(details.revenue)} />
      <KpiCard title="Custo total no mês" value={fmt(details.totalCost)} />
      <KpiCard title="Margem varejista" value={`${details.marginPct.toFixed(2)}%`} />
      <KpiCard title="Margem por cliente" value={fmt(details.marginPerClient)} />
      <KpiCard title="Prejuízo acumulado" value={fmt(Math.abs(details.cumulativeLoss))} variant="loss" />
    </>
  );
}

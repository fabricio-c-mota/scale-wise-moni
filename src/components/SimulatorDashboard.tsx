import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend,
} from "recharts";
import { runSimulation, type SimParams } from "@/lib/simulation";
import { ParamSlider } from "./ParamSlider";
import { KpiCard } from "./KpiCard";

const DEFAULT_PARAMS: SimParams = {
  n0: 100,
  growthRate: 0.12,
  months: 24,
  ticket: 150,
  alpha: 1.05,
  mMax: 0.15,
  k: 0.00003,
  cac: 50,
  fixedCosts: 10000,
  retention: 18,
};

const fmt = (v: number) =>
  v >= 1000000
    ? `R$ ${(v / 1000000).toFixed(1)}M`
    : v >= 1000
      ? `R$ ${(v / 1000).toFixed(1)}k`
      : `R$ ${v.toFixed(0)}`;

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 10%)",
  border: "1px solid hsl(220, 14%, 18%)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function SimulatorDashboard() {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const set = (key: keyof SimParams) => (v: number) =>
    setParams((p) => ({ ...p, [key]: v }));

  const { data, kpis } = useMemo(() => runSimulation(params), [params]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">BigBag Coins</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-xl">
          Simulador de viabilidade econômica — ajuste os parâmetros e visualize a projeção de escala em tempo real.
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        <KpiCard
          title="Break-even"
          value={kpis.breakEvenMonth ? `Mês ${kpis.breakEvenMonth}` : "—"}
          subtitle={kpis.breakEvenCustomers ? `${kpis.breakEvenCustomers} clientes` : "Não atingido"}
          variant={kpis.breakEvenMonth ? "profit" : "loss"}
        />
        <KpiCard
          title="Payback"
          value={kpis.paybackMonths < 100 ? `${kpis.paybackMonths} meses` : "∞"}
          variant={kpis.paybackMonths <= 6 ? "profit" : kpis.paybackMonths <= 12 ? "warning" : "loss"}
        />
        <KpiCard
          title="LTV"
          value={fmt(kpis.ltv)}
          variant="default"
        />
        <KpiCard
          title="LTV / CAC"
          value={`${kpis.ltvCacRatio}x`}
          subtitle={kpis.ltvCacRatio >= 3 ? "Saudável" : "Atenção"}
          variant={kpis.ltvCacRatio >= 3 ? "profit" : kpis.ltvCacRatio >= 1 ? "warning" : "loss"}
        />
        <KpiCard
          title="Margem Final"
          value={`${kpis.finalMarginPct.toFixed(1)}%`}
          variant="default"
        />
        <KpiCard
          title="Lucro Mês Final"
          value={fmt(kpis.finalMonthlyProfit)}
          variant={kpis.finalMonthlyProfit >= 0 ? "profit" : "loss"}
        />
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Controls */}
        <div className="space-y-5 bg-card border border-border rounded-lg p-5 h-fit animate-fade-in">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Parâmetros</h2>
          <ParamSlider label="Clientes iniciais" value={params.n0} min={10} max={1000} step={10} onChange={set("n0")} />
          <ParamSlider label="Crescimento mensal" value={params.growthRate} min={0.01} max={0.5} step={0.01} onChange={set("growthRate")} format={(v) => `${(v * 100).toFixed(0)}%`} />
          <ParamSlider label="Horizonte (meses)" value={params.months} min={6} max={60} step={1} onChange={set("months")} />
          <ParamSlider label="Ticket médio" value={params.ticket} min={20} max={500} step={10} onChange={set("ticket")} suffix=" R$" />
          <ParamSlider label="Fator de crédito (α)" value={params.alpha} min={1.0} max={1.3} step={0.01} onChange={set("alpha")} format={(v) => v.toFixed(2)} />
          <ParamSlider label="Margem máx. varejista" value={params.mMax} min={0.01} max={0.4} step={0.01} onChange={set("mMax")} format={(v) => `${(v * 100).toFixed(0)}%`} />
          <ParamSlider label="Vel. margem (k)" value={params.k} min={0.000005} max={0.0002} step={0.000005} onChange={set("k")} format={(v) => v.toFixed(6)} />
          <ParamSlider label="CAC" value={params.cac} min={5} max={200} step={5} onChange={set("cac")} suffix=" R$" />
          <ParamSlider label="Custos fixos" value={params.fixedCosts} min={1000} max={100000} step={1000} onChange={set("fixedCosts")} format={fmt} />
          <ParamSlider label="Retenção média" value={params.retention} min={3} max={48} step={1} onChange={set("retention")} suffix=" meses" />
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Customers */}
          <ChartCard title="Crescimento de Clientes">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke="hsl(215, 12%, 50%)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="customers" stroke="hsl(200, 70%, 55%)" fill="url(#gClients)" name="Clientes" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Revenue vs Cost */}
          <ChartCard title="Receita vs Custo Total">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => fmt(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(152, 60%, 48%)" strokeWidth={2} dot={false} name="Receita" />
                <Line type="monotone" dataKey="totalCost" stroke="hsl(0, 72%, 55%)" strokeWidth={2} dot={false} name="Custo Total" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Profit */}
          <ChartCard title="Lucro Mensal">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => fmt(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <ReferenceLine y={0} stroke="hsl(215, 12%, 50%)" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="profit" stroke="hsl(152, 60%, 48%)" fill="url(#gProfit)" name="Lucro" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Margin % */}
          <ChartCard title="Margem do Varejista vs Volume">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="volume" stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => fmt(v)} />
                <YAxis stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(2)}%`} />
                <Line type="monotone" dataKey="marginPct" stroke="hsl(38, 92%, 60%)" strokeWidth={2} dot={false} name="Margem %" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Cumulative */}
          <ChartCard title="Lucro Acumulado">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(280, 60%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(280, 60%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke="hsl(215, 12%, 50%)" fontSize={11} tickFormatter={(v) => fmt(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <ReferenceLine y={0} stroke="hsl(215, 12%, 50%)" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="cumulativeProfit" stroke="hsl(280, 60%, 60%)" fill="url(#gCum)" name="Acumulado" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

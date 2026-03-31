import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend,
} from "recharts";
import { runSimulation, type SimParams } from "@/lib/simulation";
import { ParamInput } from "./ParamInput";
import { KpiCard } from "./KpiCard";
import { BreakEvenCard } from "./BreakEvenCard";

const DEFAULT_PARAMS: SimParams = {
  n0: 10,
  growthRate: 0.2,
  maxCustomers: 170,
  months: 24,
  ticket: 350,
  alpha: 1.14,
  mMax: 0.3,
  k: 0.00012,
  cac: 50,
  fixedCosts: 3500,
  retention: 12,
};

const SCENARIOS: Record<"pessimista" | "realista" | "otimista", SimParams> = {
  pessimista: {
    ...DEFAULT_PARAMS,
    growthRate: 0.18,
    alpha: 1.16,
    mMax: 0.27,
    k: 0.0001,
    cac: 60,
    fixedCosts: 4000,
  },
  realista: DEFAULT_PARAMS,
  otimista: {
    ...DEFAULT_PARAMS,
    growthRate: 0.24,
    alpha: 1.1,
    mMax: 0.32,
    k: 0.00015,
    cac: 40,
    fixedCosts: 3000,
  },
};

const fmt = (v: number) =>
  v >= 1000000
    ? `R$ ${(v / 1000000).toFixed(1)}M`
    : v >= 1000
      ? `R$ ${(v / 1000).toFixed(1)}k`
      : `R$ ${v.toFixed(0)}`;

const tooltipStyle = {
  backgroundColor: "hsl(0, 0%, 100%)",
  border: "1px solid hsl(214, 32%, 91%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(222, 47%, 11%)",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const ChartReferenceLine = ReferenceLine as unknown as React.ComponentType<Record<string, unknown>>;
const GRID_STROKE = "hsl(214, 32%, 91%)";
const AXIS_STROKE = "hsl(215, 16%, 43%)";

export function SimulatorDashboard() {
  const [scenario, setScenario] = useState<"pessimista" | "realista" | "otimista">("realista");
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const set = (key: keyof SimParams) => (v: number) =>
    setParams((p) => ({ ...p, [key]: v }));
  const applyScenario = (next: "pessimista" | "realista" | "otimista") => {
    setScenario(next);
    setParams(SCENARIOS[next]);
  };

  const { data, kpis } = useMemo(() => runSimulation(params), [params]);
  const last = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : null;
  const requiredMarginPct = kpis.viabilityMarginThresholdPct;
  const marginGapPct = kpis.finalRetailMarginPct - requiredMarginPct;
  const growthAbs = prev ? last.customers - prev.customers : 0;

  const costMix = {
    product: last.totalCost > 0 ? (last.productCost / last.totalCost) * 100 : 0,
    cac: last.totalCost > 0 ? (last.cacCost / last.totalCost) * 100 : 0,
    fixed: last.totalCost > 0 ? (params.fixedCosts / last.totalCost) * 100 : 0,
  };

  const phaseLabel = !kpis.breakEvenMonth
    ? "Fase 1 - Inicial"
    : last.month <= kpis.breakEvenMonth + 4
      ? "Fase 2 - Crescimento"
      : "Fase 3 - Escala";

  const variableGlossary = [
    { symbol: "N0", name: "Clientes iniciais", value: `${params.n0}`, meaning: "Base de clientes no mês 1." },
    { symbol: "r", name: "Velocidade de crescimento", value: `${(params.growthRate * 100).toFixed(1)}%`, meaning: "Controla a inclinação da curva logística de clientes." },
    { symbol: "N_max", name: "Teto de clientes", value: `${params.maxCustomers.toFixed(0)}`, meaning: "Capacidade máxima da base; limita o crescimento no longo prazo." },
    { symbol: "T", name: "Ticket médio", value: fmt(params.ticket), meaning: "Receita mensal média por cliente." },
    { symbol: "alpha", name: "Fator de crédito", value: params.alpha.toFixed(2), meaning: "Multiplica o crédito concedido ao cliente." },
    { symbol: "mMax", name: "Margem máxima varejista", value: `${(params.mMax * 100).toFixed(1)}%`, meaning: "Teto da margem negociável com escala." },
    { symbol: "k", name: "Velocidade da margem", value: params.k.toFixed(6), meaning: "Determina quão rápido a margem aproxima mMax." },
    { symbol: "S_t", name: "Subsídio mensal", value: fmt(kpis.finalMonthlySubsidy), meaning: "Custo recorrente do crédito ampliado: N_t * T * (alpha - 1)." },
    { symbol: "CAC", name: "Custo de aquisição", value: fmt(params.cac), meaning: "Custo por novo cliente no mês." },
    { symbol: "F", name: "Custos fixos", value: fmt(params.fixedCosts), meaning: "Custos recorrentes mensais do negócio." },
    { symbol: "retention", name: "Retenção média", value: `${params.retention} meses`, meaning: "Tempo médio de permanência do cliente." },
    { symbol: "m(V)", name: "Margem efetiva", value: `${kpis.finalRetailMarginPct.toFixed(2)}%`, meaning: "Margem obtida no volume atual." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 md:p-8">
      <div className="mx-auto max-w-[1400px]">
      <header className="mb-8 animate-fade-in rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">BigBag Coins</h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-xl">
              Simulador de viabilidade econômica — ajuste os parâmetros e visualize a projeção de escala em tempo real.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            Cenário ativo: <span className="font-semibold text-foreground capitalize">{scenario}</span>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 rounded-lg border border-border bg-background/50 p-2">
          {Object.keys(SCENARIOS).map((s) => {
            const key = s as "pessimista" | "realista" | "otimista";
            const active = scenario === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyScenario(key)}
                className={`rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </header>

      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visão executiva</h2>
        <p className="text-xs text-muted-foreground">Indicadores principais para decisão rápida</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-fr gap-3 mb-8">
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
          title="Viabilidade"
          value={kpis.isViableAtFinalMonth ? "Viável" : "Não viável"}
          subtitle={`Margem final ${kpis.finalRetailMarginPct.toFixed(2)}% | mínimo ${kpis.viabilityMarginThresholdPct.toFixed(2)}%`}
          variant={kpis.isViableAtFinalMonth ? "profit" : "loss"}
        />
        <KpiCard
          title="Lucro Mês Final"
          value={fmt(kpis.finalMonthlyProfit)}
          variant={kpis.finalMonthlyProfit >= 0 ? "profit" : "loss"}
        />
        <KpiCard
          title="Subsídio Mensal"
          value={fmt(kpis.finalMonthlySubsidy)}
          subtitle="Custo recorrente do crédito ampliado"
          variant="warning"
        />
        <KpiCard
          title="Subsídio Acumulado"
          value={fmt(kpis.cumulativeSubsidy)}
          subtitle="Total concedido até o mês atual"
          variant="warning"
        />
      </div>

      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Break-even detalhado</h2>
        <p className="text-xs text-muted-foreground">Momento e condições do ponto de equilíbrio</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-fr gap-3 mb-8">
        <BreakEvenCard details={kpis.breakEvenDetails} />
      </div>

      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Insights operacionais</h2>
        <p className="text-xs text-muted-foreground">Leitura tática do mês final da projeção</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 auto-rows-fr gap-3 mb-8">
        <InsightCard
          title="Fase Atual do Modelo"
          value={phaseLabel}
          detail={`Crescimento do mês atual: +${growthAbs} clientes`}
          explanation="Mostra em que estágio econômico o negócio está: início com pressão de custos, crescimento com melhora de margem ou escala com lucro mais consistente."
        />
        <InsightCard
          title="Gap de Viabilidade"
          value={`${marginGapPct >= 0 ? "+" : ""}${marginGapPct.toFixed(2)} p.p.`}
          detail={`Margem final ${kpis.finalRetailMarginPct.toFixed(2)}% vs mínimo ${requiredMarginPct.toFixed(2)}%`}
          explanation="Compara a margem atual com a margem mínima necessária para o modelo se sustentar. Gap positivo indica folga operacional."
        />
        <InsightCard
          title="Composição de Custo (Mês Final)"
          value={`Produto ${costMix.product.toFixed(1)}%`}
          detail={`CAC ${costMix.cac.toFixed(1)}% | Fixo ${costMix.fixed.toFixed(1)}%`}
          explanation="Mostra que CAC é pontual (novos clientes), enquanto o custo de produto inclui o subsídio recorrente do crédito ampliado."
        />
        <InsightCard
          title="Situação de Escala"
          value={kpis.breakEvenMonth ? `Break-even no mês ${kpis.breakEvenMonth}` : "Sem break-even"}
          detail={`Clientes no mês final: ${last.customers.toLocaleString("pt-BR")}`}
          explanation="Resume se a base de clientes já alcançou o volume necessário para manter resultado mensal positivo."
        />
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Controls */}
        <div className="space-y-4 bg-card border border-border rounded-lg p-5 h-fit animate-fade-in shadow-sm lg:sticky lg:top-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Parâmetros</h2>
          <div className="grid grid-cols-2 gap-3">
            <ParamInput label="Clientes iniciais" value={params.n0} min={0} step={10} onChange={set("n0")} />
            <ParamInput label="Crescimento mensal" value={params.growthRate} min={-0.99} step={0.01} onChange={set("growthRate")} />
            <ParamInput label="Teto máximo de clientes" value={params.maxCustomers} min={1} step={100} onChange={set("maxCustomers")} />
            <ParamInput label="Horizonte (meses)" value={params.months} min={1} step={1} onChange={set("months")} suffix="meses" />
            <ParamInput label="Ticket médio" value={params.ticket} min={0} step={10} onChange={set("ticket")} suffix="R$" />
            <ParamInput label="Fator de crédito (α)" value={params.alpha} min={0} step={0.01} onChange={set("alpha")} />
            <ParamInput label="Margem máx. varejista" value={params.mMax} min={0} step={0.01} onChange={set("mMax")} />
            <ParamInput label="Vel. margem (k)" value={params.k} min={0} step={0.000005} onChange={set("k")} />
            <ParamInput label="CAC" value={params.cac} min={0} step={5} onChange={set("cac")} suffix="R$" />
            <ParamInput label="Custos fixos" value={params.fixedCosts} min={0} step={1000} onChange={set("fixedCosts")} suffix="R$" />
            <ParamInput label="Retenção média" value={params.retention} min={1} step={1} onChange={set("retention")} suffix="meses" />
          </div>
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
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke={AXIS_STROKE} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="customers" stroke="hsl(200, 70%, 55%)" fill="url(#gClients)" name="Clientes" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Revenue vs Cost */}
          <ChartCard title="Receita vs Custo Total">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => fmt(v)} />
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
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => fmt(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <ChartReferenceLine y={0} stroke={AXIS_STROKE} strokeDasharray="3 3" />
                {kpis.breakEvenMonth && (
                  <ChartReferenceLine
                    x={kpis.breakEvenMonth}
                    stroke="hsl(38, 92%, 60%)"
                    strokeDasharray="4 4"
                    label={{ value: "Break-even", position: "insideTopRight", fill: "hsl(38, 92%, 60%)", fontSize: 11 }}
                  />
                )}
                <Area type="monotone" dataKey="profit" stroke="hsl(152, 60%, 48%)" fill="url(#gProfit)" name="Lucro" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Margin % */}
          <ChartCard title="Margem do Varejista vs Volume">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="volume" stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => fmt(v)} />
                <YAxis stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => `${v.toFixed(1)}%`} />
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
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => fmt(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <ChartReferenceLine y={0} stroke={AXIS_STROKE} strokeDasharray="3 3" />
                <Area type="monotone" dataKey="cumulativeProfit" stroke="hsl(280, 60%, 60%)" fill="url(#gCum)" name="Acumulado" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Subsídio Mensal e Acumulado">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => `M${v}`} />
                <YAxis stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => fmt(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <Legend />
                <Line type="monotone" dataKey="subsidy" stroke="hsl(38, 92%, 60%)" strokeWidth={2} dot={false} name="Subsídio mensal" />
                <Line type="monotone" dataKey="cumulativeSubsidy" stroke="hsl(20, 85%, 45%)" strokeWidth={2} dot={false} name="Subsídio acumulado" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Break-even by customers */}
          <ChartCard title="Break-even: Lucro vs Clientes">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="customers" stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => `${v}`} />
                <YAxis stroke={AXIS_STROKE} fontSize={11} tickFormatter={(v) => fmt(v)} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => fmt(v)}
                  labelFormatter={(v) => `${v} clientes`}
                />
                <ChartReferenceLine y={0} stroke={AXIS_STROKE} strokeDasharray="3 3" />
                {kpis.breakEvenCustomers && (
                  <ChartReferenceLine x={kpis.breakEvenCustomers} stroke="hsl(38, 92%, 60%)" strokeDasharray="4 4" />
                )}
                <Line type="monotone" dataKey="profit" stroke="hsl(200, 70%, 55%)" strokeWidth={2} dot={false} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="mt-8 grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card border border-border rounded-lg p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">O que é cada variável</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="py-2 pr-3">Símbolo</th>
                  <th className="py-2 pr-3">Variável</th>
                  <th className="py-2 pr-3">Valor atual</th>
                  <th className="py-2">Como impacta</th>
                </tr>
              </thead>
              <tbody>
                {variableGlossary.map((item) => (
                  <tr key={item.symbol} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-mono text-xs">{item.symbol}</td>
                    <td className="py-2 pr-3">{item.name}</td>
                    <td className="py-2 pr-3 font-mono">{item.value}</td>
                    <td className="py-2 text-muted-foreground">{item.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 animate-fade-in space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Como tudo funciona</h3>
          <p className="text-sm text-muted-foreground">1. O sistema projeta clientes mês a mês com curva logística: N(t) = N_max / (1 + ((N_max - N0)/N0) * e^(-r*t)).</p>
          <p className="text-sm text-muted-foreground">2. Calcula o subsídio recorrente: S_t = N_t * T * (alpha - 1), custo estrutural do modelo no início.</p>
          <p className="text-sm text-muted-foreground">3. O CAC é pontual e só incide em novos clientes (não é custo recorrente mensal da base inteira).</p>
          <p className="text-sm text-muted-foreground">4. Aplica margem por escala m(V_t) e calcula lucro: receita - custo_produto - custo_fixo - CAC.</p>
          <p className="text-sm text-muted-foreground">5. A virada econômica ocorre quando margem do varejista supera o subsídio unitário: m(V_t) &gt; (alpha - 1).</p>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-lg p-5 animate-fade-in shadow-sm">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">O que cada gráfico mostra</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
          <GraphHint title="Crescimento de Clientes" text="Evolução da base em curva logística; valida velocidade de crescimento e aproximação do teto N_max." />
          <GraphHint title="Receita vs Custo Total" text="Compara entrada e saída de caixa mensal para visualizar aproximação do equilíbrio." />
          <GraphHint title="Lucro Mensal" text="Mostra quando o resultado mensal cruza zero e quando o negócio fica positivo." />
          <GraphHint title="Margem do Varejista vs Volume" text="Mostra ganho de poder de negociação com aumento de volume (escala)." />
          <GraphHint title="Lucro Acumulado" text="Mostra quanto prejuízo total foi absorvido antes de recuperar o investimento." />
          <GraphHint title="Subsídio Mensal e Acumulado" text="Evidencia explicitamente o custo recorrente do crédito ampliado e seu acúmulo ao longo do tempo." />
          <GraphHint title="Break-even: Lucro vs Clientes" text="Relaciona lucro diretamente ao tamanho da base para identificar clientes necessários." />
        </div>
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

function InsightCard({
  title,
  value,
  detail,
  explanation,
}: {
  title: string;
  value: string;
  detail: string;
  explanation: string;
}) {
  return (
    <div className="h-full min-h-[170px] rounded-lg bg-card border border-border p-4 animate-fade-in flex flex-col justify-between gap-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{detail}</p>
      <p className="text-[11px] leading-relaxed text-muted-foreground/90 border-t border-border pt-2">
        {explanation}
      </p>
    </div>
  );
}

function GraphHint({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="font-semibold mb-1">{title}</p>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

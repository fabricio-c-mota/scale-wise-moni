export interface SimParams {
  n0: number;         // initial customers
  growthRate: number;  // monthly growth rate (r)
  maxCustomers: number; // carrying capacity (N_max)
  months: number;      // simulation horizon
  ticket: number;      // avg monthly ticket (T)
  alpha: number;       // credit factor
  mMax: number;        // max retailer margin
  k: number;           // margin growth rate
  cac: number;         // customer acquisition cost
  fixedCosts: number;  // monthly fixed costs (F)
  retention: number;   // avg retention months
}

export interface MonthData {
  month: number;
  customers: number;
  newCustomers: number;
  revenue: number;
  volume: number;
  marginPct: number;
  subsidy: number;
  cumulativeSubsidy: number;
  creditCost: number;
  productCost: number;
  cacCost: number;
  totalCost: number;
  profit: number;
  cumulativeProfit: number;
  marginPerClient: number;
}

export interface BreakEvenDetails {
  month: number;
  customers: number;
  revenue: number;
  totalCost: number;
  marginPct: number;
  cumulativeLoss: number;
  marginPerClient: number;
}

export interface KPIs {
  breakEvenMonth: number | null;
  breakEvenCustomers: number | null;
  breakEvenDetails: BreakEvenDetails | null;
  cumulativeBreakEvenMonth: number | null;
  cumulativeBreakEvenCustomers: number | null;
  minCumulativeProfit: number;
  requiredCashReserve: number;
  paybackMonths: number;
  ltv: number;
  ltvCacRatio: number;
  viabilityMarginThresholdPct: number;
  finalRetailMarginPct: number;
  isViableAtFinalMonth: boolean;
  finalMonthlySubsidy: number;
  cumulativeSubsidy: number;
  finalMarginPct: number;
  finalMonthlyProfit: number;
}

export function runSimulation(p: SimParams): { data: MonthData[]; kpis: KPIs } {
  const data: MonthData[] = [];
  let cumProfit = 0;
  let cumSubsidy = 0;
  let breakEvenMonth: number | null = null;
  let breakEvenCustomers: number | null = null;
  let breakEvenDetails: BreakEvenDetails | null = null;
  let cumulativeBreakEvenMonth: number | null = null;
  let cumulativeBreakEvenCustomers: number | null = null;
  let minCumulativeProfit = 0;

  const projectedCustomers = (t: number) => {
    const n0 = Math.max(0, p.n0);
    const nMax = Math.max(1, p.maxCustomers);

    if (n0 <= 0) return 0;
    if (n0 >= nMax) return Math.round(nMax);

    // Logistic growth with carrying capacity (N_max)
    const ratio = (nMax - n0) / n0;
    const customers = nMax / (1 + ratio * Math.exp(-p.growthRate * t));
    return Math.round(Math.min(nMax, Math.max(0, customers)));
  };

  for (let t = 0; t < p.months; t++) {
    const customers = projectedCustomers(t);
    const prevCustomers = t === 0 ? 0 : projectedCustomers(t - 1);
    const newCustomers = t === 0 ? customers : Math.max(0, customers - prevCustomers);

    const revenue = customers * p.ticket;
    const volume = revenue;
    const marginPct = p.mMax * (1 - Math.exp(-p.k * volume));
    const subsidy = customers * p.ticket * (p.alpha - 1);
    cumSubsidy += subsidy;

    const creditCost = customers * p.ticket * p.alpha;
    const productCost = creditCost * (1 - marginPct);
    const cacCost = p.cac * newCustomers;
    const totalCost = productCost + cacCost + p.fixedCosts;
    const profit = revenue - totalCost;
    cumProfit += profit;
    minCumulativeProfit = Math.min(minCumulativeProfit, cumProfit);

    if (breakEvenMonth === null && profit >= 0) {
      breakEvenMonth = t + 1;
      breakEvenCustomers = customers;
      breakEvenDetails = {
        month: t + 1,
        customers,
        revenue,
        totalCost,
        marginPct: marginPct * 100,
        cumulativeLoss: cumProfit - profit, // accumulated loss before this month
        marginPerClient: p.ticket - (p.ticket * p.alpha * (1 - marginPct)),
      };
    }

    if (cumulativeBreakEvenMonth === null && cumProfit >= 0) {
      cumulativeBreakEvenMonth = t + 1;
      cumulativeBreakEvenCustomers = customers;
    }

    const marginPerClient = p.ticket - (p.ticket * p.alpha * (1 - marginPct));

    data.push({
      month: t + 1,
      customers,
      newCustomers,
      revenue,
      volume,
      marginPct: marginPct * 100,
      subsidy,
      cumulativeSubsidy: cumSubsidy,
      creditCost,
      productCost,
      cacCost,
      totalCost,
      profit,
      cumulativeProfit: cumProfit,
      marginPerClient,
    });
  }

  const lastMonth = data[data.length - 1];
  const avgMarginPerClient = lastMonth.marginPerClient;
  const paybackMonths = avgMarginPerClient > 0 ? p.cac / avgMarginPerClient : Infinity;
  const ltv = avgMarginPerClient * p.retention;
  const ltvCacRatio = p.cac > 0 ? ltv / p.cac : Infinity;
  const viabilityMarginThresholdPct = (p.alpha - 1) * 100;
  const finalRetailMarginPct = lastMonth.marginPct;
  const isViableAtFinalMonth = finalRetailMarginPct > viabilityMarginThresholdPct;
  const requiredCashReserve = minCumulativeProfit < 0 ? Math.abs(minCumulativeProfit) * 1.2 : 0;

  return {
    data,
    kpis: {
      breakEvenMonth,
      breakEvenCustomers,
      breakEvenDetails,
      cumulativeBreakEvenMonth,
      cumulativeBreakEvenCustomers,
      minCumulativeProfit: Math.round(minCumulativeProfit * 100) / 100,
      requiredCashReserve: Math.round(requiredCashReserve * 100) / 100,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      ltv: Math.round(ltv * 100) / 100,
      ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
      viabilityMarginThresholdPct: Math.round(viabilityMarginThresholdPct * 100) / 100,
      finalRetailMarginPct: Math.round(finalRetailMarginPct * 100) / 100,
      isViableAtFinalMonth,
      finalMonthlySubsidy: lastMonth.subsidy,
      cumulativeSubsidy: lastMonth.cumulativeSubsidy,
      finalMarginPct: lastMonth.marginPct,
      finalMonthlyProfit: lastMonth.profit,
    },
  };
}

export interface SimParams {
  n0: number;         // initial customers
  growthRate: number;  // monthly growth rate (r)
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
  paybackMonths: number;
  ltv: number;
  ltvCacRatio: number;
  viabilityMarginThresholdPct: number;
  finalRetailMarginPct: number;
  isViableAtFinalMonth: boolean;
  finalMarginPct: number;
  finalMonthlyProfit: number;
}

export function runSimulation(p: SimParams): { data: MonthData[]; kpis: KPIs } {
  const data: MonthData[] = [];
  let cumProfit = 0;
  let breakEvenMonth: number | null = null;
  let breakEvenCustomers: number | null = null;
  let breakEvenDetails: BreakEvenDetails | null = null;

  for (let t = 0; t < p.months; t++) {
    const customers = Math.round(p.n0 * Math.pow(1 + p.growthRate, t));
    const prevCustomers = t === 0 ? 0 : Math.round(p.n0 * Math.pow(1 + p.growthRate, t - 1));
    const newCustomers = t === 0 ? customers : customers - prevCustomers;

    const revenue = customers * p.ticket;
    const volume = revenue;
    const marginPct = p.mMax * (1 - Math.exp(-p.k * volume));

    const creditCost = customers * p.ticket * p.alpha;
    const productCost = creditCost * (1 - marginPct);
    const cacCost = p.cac * newCustomers;
    const totalCost = productCost + cacCost + p.fixedCosts;
    const profit = revenue - totalCost;
    cumProfit += profit;

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

    const marginPerClient = p.ticket - (p.ticket * p.alpha * (1 - marginPct));

    data.push({
      month: t + 1,
      customers,
      newCustomers,
      revenue,
      volume,
      marginPct: marginPct * 100,
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
  const viabilityMarginThresholdPct = (1 - 1 / p.alpha) * 100;
  const finalRetailMarginPct = lastMonth.marginPct;
  const isViableAtFinalMonth = finalRetailMarginPct > viabilityMarginThresholdPct;

  return {
    data,
    kpis: {
      breakEvenMonth,
      breakEvenCustomers,
      breakEvenDetails,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      ltv: Math.round(ltv * 100) / 100,
      ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
      viabilityMarginThresholdPct: Math.round(viabilityMarginThresholdPct * 100) / 100,
      finalRetailMarginPct: Math.round(finalRetailMarginPct * 100) / 100,
      isViableAtFinalMonth,
      finalMarginPct: lastMonth.marginPct,
      finalMonthlyProfit: lastMonth.profit,
    },
  };
}

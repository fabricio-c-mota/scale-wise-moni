import { describe, expect, it } from "vitest";
import { runSimulation, type SimParams } from "@/lib/simulation";

describe("runSimulation", () => {
  it("calcula crescimento, receita e custos no primeiro mes", () => {
    const params: SimParams = {
      n0: 100,
      growthRate: 0,
      months: 1,
      ticket: 100,
      alpha: 1,
      mMax: 0,
      k: 0,
      cac: 10,
      fixedCosts: 1000,
      retention: 12,
    };

    const { data, kpis } = runSimulation(params);
    const m1 = data[0];

    expect(m1.customers).toBe(100);
    expect(m1.revenue).toBe(10000);
    expect(m1.marginPct).toBe(0);
    expect(m1.creditCost).toBe(10000);
    expect(m1.productCost).toBe(10000);
    expect(m1.cacCost).toBe(1000);
    expect(m1.totalCost).toBe(12000);
    expect(m1.profit).toBe(-2000);
    expect(kpis.breakEvenMonth).toBeNull();
  });

  it("identifica break-even quando lucro mensal fica positivo", () => {
    const params: SimParams = {
      n0: 100,
      growthRate: 0,
      months: 2,
      ticket: 100,
      alpha: 1,
      mMax: 0,
      k: 0,
      cac: 5,
      fixedCosts: 400,
      retention: 12,
    };

    const { data, kpis } = runSimulation(params);

    expect(data[0].profit).toBe(-900);
    expect(data[1].profit).toBe(-400);
    expect(kpis.breakEvenMonth).toBeNull();

    const withLowerFixedCosts = runSimulation({ ...params, fixedCosts: 0 });
    expect(withLowerFixedCosts.kpis.breakEvenMonth).toBe(2);
    expect(withLowerFixedCosts.kpis.breakEvenCustomers).toBe(100);
  });

  it("calcula condicao de viabilidade com base em alpha", () => {
    const params: SimParams = {
      n0: 1000,
      growthRate: 0,
      months: 1,
      ticket: 150,
      alpha: 1.05,
      mMax: 0.2,
      k: 0.0001,
      cac: 10,
      fixedCosts: 1000,
      retention: 18,
    };

    const { kpis } = runSimulation(params);

    expect(kpis.viabilityMarginThresholdPct).toBeCloseTo(5, 2);
    expect(kpis.finalRetailMarginPct).toBeGreaterThan(0);
    expect(typeof kpis.isViableAtFinalMonth).toBe("boolean");
  });

  it("explicita subsidio mensal e acumulado", () => {
    const params: SimParams = {
      n0: 100,
      growthRate: 0,
      months: 2,
      ticket: 200,
      alpha: 1.05,
      mMax: 0,
      k: 0,
      cac: 0,
      fixedCosts: 0,
      retention: 12,
    };

    const { data, kpis } = runSimulation(params);

    expect(data[0].subsidy).toBeCloseTo(1000, 6);
    expect(data[1].cumulativeSubsidy).toBeCloseTo(2000, 6);
    expect(kpis.finalMonthlySubsidy).toBeCloseTo(1000, 6);
    expect(kpis.cumulativeSubsidy).toBeCloseTo(2000, 6);
  });
});

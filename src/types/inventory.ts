export interface SKUData {
  id: string;
  name: string;
  currentInventory: number;
  dailySalesRate: number;
  salesVariability: number; // Standard deviation as percentage
  leadTimeDays: number;
  leadTimeVariability: number; // Standard deviation in days
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  holdingCostPercent: number;
}

export interface RiskAnalysis {
  skuId: string;
  overstockRisk: number; // 0-100 probability
  understockRisk: number; // 0-100 probability
  deadInventoryRisk: number; // 0-100 probability
  daysOfSupply: number;
  projectedStockout: number | null; // days until stockout or null if no risk
  safetyStock: number;
  optimalReorderPoint: number;
  simulationResults: SimulationResult[];
}

export interface SimulationResult {
  day: number;
  inventoryLevel: number;
  demand: number;
  stockout: boolean;
  overstock: boolean;
}

export interface DashboardMetrics {
  totalSKUs: number;
  atRiskSKUs: number;
  healthySKUs: number;
  averageOverstockRisk: number;
  averageUnderstockRisk: number;
  averageDeadInventoryRisk: number;
  totalInventoryValue: number;
  projectedLosses: number;
}

export interface WhatIfScenario {
  inventoryMultiplier: number;
  demandMultiplier: number;
  leadTimeMultiplier: number;
  variabilityMultiplier: number;
}

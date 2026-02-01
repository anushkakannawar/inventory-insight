import { SKUData, RiskAnalysis, SimulationResult, DashboardMetrics, WhatIfScenario } from '@/types/inventory';

// Box-Muller transform for normal distribution
function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// Ensure non-negative values
function clampPositive(value: number): number {
  return Math.max(0, value);
}

export function runMonteCarloSimulation(
  sku: SKUData,
  numSimulations: number = 1000,
  forecastDays: number = 90,
  scenario: WhatIfScenario = { inventoryMultiplier: 1, demandMultiplier: 1, leadTimeMultiplier: 1, variabilityMultiplier: 1 }
): SimulationResult[] {
  const results: SimulationResult[] = [];
  
  // Track aggregate results across simulations
  const dailyAggregates: { inventory: number[]; demand: number[]; stockouts: number; overstocks: number }[] = 
    Array.from({ length: forecastDays }, () => ({ inventory: [], demand: [], stockouts: 0, overstocks: 0 }));

  const adjustedInventory = sku.currentInventory * scenario.inventoryMultiplier;
  const adjustedDailySales = sku.dailySalesRate * scenario.demandMultiplier;
  const adjustedVariability = sku.salesVariability * scenario.variabilityMultiplier;
  const adjustedLeadTime = sku.leadTimeDays * scenario.leadTimeMultiplier;

  for (let sim = 0; sim < numSimulations; sim++) {
    let inventory = adjustedInventory;
    let pendingOrders: { arrivalDay: number; quantity: number }[] = [];
    let lastOrderDay = -999;

    for (let day = 0; day < forecastDays; day++) {
      // Check for arriving orders
      pendingOrders = pendingOrders.filter(order => {
        if (order.arrivalDay === day) {
          inventory += order.quantity;
          return false;
        }
        return true;
      });

      // Generate random demand
      const demandStdDev = adjustedDailySales * (adjustedVariability / 100);
      const demand = clampPositive(normalRandom(adjustedDailySales, demandStdDev));
      
      // Apply demand
      inventory = Math.max(0, inventory - demand);

      // Check if we need to reorder
      if (inventory <= sku.reorderPoint && day - lastOrderDay > 5) {
        const leadTimeStdDev = sku.leadTimeVariability;
        const actualLeadTime = Math.round(clampPositive(normalRandom(adjustedLeadTime, leadTimeStdDev)));
        pendingOrders.push({
          arrivalDay: day + actualLeadTime,
          quantity: sku.reorderQuantity
        });
        lastOrderDay = day;
      }

      // Record daily aggregate
      dailyAggregates[day].inventory.push(inventory);
      dailyAggregates[day].demand.push(demand);
      if (inventory === 0) dailyAggregates[day].stockouts++;
      if (inventory > sku.reorderQuantity * 2) dailyAggregates[day].overstocks++;
    }
  }

  // Calculate average results
  for (let day = 0; day < forecastDays; day++) {
    const avgInventory = dailyAggregates[day].inventory.reduce((a, b) => a + b, 0) / numSimulations;
    const avgDemand = dailyAggregates[day].demand.reduce((a, b) => a + b, 0) / numSimulations;
    
    results.push({
      day: day + 1,
      inventoryLevel: Math.round(avgInventory),
      demand: Math.round(avgDemand),
      stockout: dailyAggregates[day].stockouts > numSimulations * 0.1, // >10% stockout rate
      overstock: dailyAggregates[day].overstocks > numSimulations * 0.5 // >50% overstock rate
    });
  }

  return results;
}

export function analyzeRisk(sku: SKUData, scenario?: WhatIfScenario): RiskAnalysis {
  const simulationResults = runMonteCarloSimulation(sku, 1000, 90, scenario);
  
  // Calculate risk metrics from simulation
  const stockoutDays = simulationResults.filter(r => r.stockout).length;
  const overstockDays = simulationResults.filter(r => r.overstock).length;
  
  // Days of supply
  const daysOfSupply = sku.dailySalesRate > 0 
    ? Math.round(sku.currentInventory / sku.dailySalesRate) 
    : 999;
  
  // Understock risk: probability of stockout in next 90 days
  const understockRisk = Math.min(100, Math.round((stockoutDays / 90) * 100 * 1.5));
  
  // Overstock risk: based on inventory turnover and holding costs
  const turnoverRatio = (sku.dailySalesRate * 365) / sku.currentInventory;
  const overstockRisk = Math.min(100, Math.round((overstockDays / 90) * 100));
  
  // Dead inventory risk: inventory that hasn't moved and unlikely to sell
  const deadInventoryRisk = Math.min(100, Math.round(
    daysOfSupply > 180 ? 80 :
    daysOfSupply > 90 ? 40 :
    daysOfSupply > 60 ? 20 : 5
  ));
  
  // Find first projected stockout day
  const stockoutDay = simulationResults.find(r => r.stockout);
  const projectedStockout = stockoutDay ? stockoutDay.day : null;
  
  // Calculate safety stock (service level 95%)
  const zScore = 1.65; // 95% service level
  const demandStdDev = sku.dailySalesRate * (sku.salesVariability / 100);
  const safetyStock = Math.round(zScore * demandStdDev * Math.sqrt(sku.leadTimeDays));
  
  // Optimal reorder point
  const optimalReorderPoint = Math.round(
    (sku.dailySalesRate * sku.leadTimeDays) + safetyStock
  );

  return {
    skuId: sku.id,
    overstockRisk,
    understockRisk,
    deadInventoryRisk,
    daysOfSupply,
    projectedStockout,
    safetyStock,
    optimalReorderPoint,
    simulationResults
  };
}

export function calculateDashboardMetrics(skus: SKUData[], analyses: RiskAnalysis[]): DashboardMetrics {
  const totalSKUs = skus.length;
  
  const atRiskSKUs = analyses.filter(a => 
    a.understockRisk > 50 || a.overstockRisk > 50 || a.deadInventoryRisk > 50
  ).length;
  
  const healthySKUs = totalSKUs - atRiskSKUs;
  
  const averageOverstockRisk = analyses.reduce((sum, a) => sum + a.overstockRisk, 0) / totalSKUs;
  const averageUnderstockRisk = analyses.reduce((sum, a) => sum + a.understockRisk, 0) / totalSKUs;
  const averageDeadInventoryRisk = analyses.reduce((sum, a) => sum + a.deadInventoryRisk, 0) / totalSKUs;
  
  const totalInventoryValue = skus.reduce((sum, s) => sum + (s.currentInventory * s.unitCost), 0);
  
  // Estimated losses from at-risk inventory
  const projectedLosses = skus.reduce((sum, sku, idx) => {
    const analysis = analyses[idx];
    const overstockLoss = (analysis.overstockRisk / 100) * sku.currentInventory * sku.unitCost * 0.2;
    const deadStockLoss = (analysis.deadInventoryRisk / 100) * sku.currentInventory * sku.unitCost * 0.5;
    return sum + overstockLoss + deadStockLoss;
  }, 0);

  return {
    totalSKUs,
    atRiskSKUs,
    healthySKUs,
    averageOverstockRisk: Math.round(averageOverstockRisk),
    averageUnderstockRisk: Math.round(averageUnderstockRisk),
    averageDeadInventoryRisk: Math.round(averageDeadInventoryRisk),
    totalInventoryValue: Math.round(totalInventoryValue),
    projectedLosses: Math.round(projectedLosses)
  };
}

export function getRiskLevel(riskValue: number): 'low' | 'medium' | 'high' {
  if (riskValue <= 30) return 'low';
  if (riskValue <= 60) return 'medium';
  return 'high';
}

export function getRiskExplanation(analysis: RiskAnalysis, sku: SKUData): string {
  const explanations: string[] = [];
  
  if (analysis.understockRisk > 50) {
    explanations.push(`High stockout risk: You have about ${analysis.daysOfSupply} days of supply remaining. Consider reordering soon.`);
  }
  
  if (analysis.overstockRisk > 50) {
    explanations.push(`Excess inventory detected: Current stock may take longer than expected to sell, tying up capital.`);
  }
  
  if (analysis.deadInventoryRisk > 40) {
    explanations.push(`Slow-moving inventory: This item shows signs of becoming dead stock. Consider promotions or markdowns.`);
  }
  
  if (analysis.optimalReorderPoint !== sku.reorderPoint) {
    const diff = analysis.optimalReorderPoint - sku.reorderPoint;
    explanations.push(`Recommended reorder point adjustment: ${diff > 0 ? 'Increase' : 'Decrease'} by ${Math.abs(diff)} units for 95% service level.`);
  }
  
  if (explanations.length === 0) {
    explanations.push('Inventory levels look healthy. Current replenishment strategy is working well.');
  }
  
  return explanations.join(' ');
}

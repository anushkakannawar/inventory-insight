import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sliders, RefreshCw, ArrowLeft, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyzeRisk } from '@/lib/simulation';
import { WhatIfScenario, RiskAnalysis } from '@/types/inventory';

export default function SimulatorPage() {
  const { skus, loadSampleData } = useInventory();
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<WhatIfScenario>({
    inventoryMultiplier: 1,
    demandMultiplier: 1,
    leadTimeMultiplier: 1,
    variabilityMultiplier: 1,
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedAnalysis, setSimulatedAnalysis] = useState<RiskAnalysis | null>(null);
  const [baselineAnalysis, setBaselineAnalysis] = useState<RiskAnalysis | null>(null);

  const selectedSku = useMemo(() => {
    return skus.find((s) => s.id === selectedSkuId) || skus[0];
  }, [skus, selectedSkuId]);

  useEffect(() => {
    if (selectedSku) {
      const baseline = analyzeRisk(selectedSku);
      setBaselineAnalysis(baseline);
      setSimulatedAnalysis(baseline);
    }
  }, [selectedSku]);

  const runSimulation = () => {
    if (!selectedSku) return;
    setIsSimulating(true);
    setTimeout(() => {
      const result = analyzeRisk(selectedSku, scenario);
      setSimulatedAnalysis(result);
      setIsSimulating(false);
    }, 500);
  };

  const resetScenario = () => {
    setScenario({
      inventoryMultiplier: 1,
      demandMultiplier: 1,
      leadTimeMultiplier: 1,
      variabilityMultiplier: 1,
    });
  };

  const getRiskChange = (current: number, baseline: number) => {
    const diff = current - baseline;
    if (Math.abs(diff) < 3) return { icon: Minus, color: 'text-muted-foreground', text: 'No change' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-risk-high', text: `+${diff}%` };
    return { icon: TrendingDown, color: 'text-risk-low', text: `${diff}%` };
  };

  // Empty state
  if (skus.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md space-y-6"
          >
            <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sliders className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">What-If Simulator</h1>
              <p className="text-muted-foreground">
                Load inventory data to explore how different scenarios affect your risk levels.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/input">
                <Button size="lg">Add Inventory Data</Button>
              </Link>
              <Button size="lg" variant="outline" onClick={loadSampleData} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Load Sample Data
              </Button>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">What-If Simulator</h1>
            <p className="text-muted-foreground mt-1">
              Explore how different scenarios impact your inventory risk
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Scenario Controls
              </CardTitle>
              <CardDescription>
                Adjust parameters to see how they affect risk levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SKU Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select SKU</label>
                <Select
                  value={selectedSkuId || skus[0]?.id}
                  onValueChange={setSelectedSkuId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {skus.map((sku) => (
                      <SelectItem key={sku.id} value={sku.id}>
                        {sku.name || sku.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Level */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Inventory Level</label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(scenario.inventoryMultiplier * 100)}%
                  </span>
                </div>
                <Slider
                  value={[scenario.inventoryMultiplier * 100]}
                  onValueChange={([v]) => setScenario({ ...scenario, inventoryMultiplier: v / 100 })}
                  min={25}
                  max={200}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Simulates having {Math.round(scenario.inventoryMultiplier * 100)}% of current stock
                </p>
              </div>

              {/* Demand */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Demand Forecast</label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(scenario.demandMultiplier * 100)}%
                  </span>
                </div>
                <Slider
                  value={[scenario.demandMultiplier * 100]}
                  onValueChange={([v]) => setScenario({ ...scenario, demandMultiplier: v / 100 })}
                  min={50}
                  max={200}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  What if demand {scenario.demandMultiplier > 1 ? 'increases' : 'decreases'} by{' '}
                  {Math.abs(Math.round((scenario.demandMultiplier - 1) * 100))}%?
                </p>
              </div>

              {/* Lead Time */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Lead Time</label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(scenario.leadTimeMultiplier * 100)}%
                  </span>
                </div>
                <Slider
                  value={[scenario.leadTimeMultiplier * 100]}
                  onValueChange={([v]) => setScenario({ ...scenario, leadTimeMultiplier: v / 100 })}
                  min={50}
                  max={200}
                  step={10}
                />
                <p className="text-xs text-muted-foreground">
                  Simulates supplier delays or faster delivery
                </p>
              </div>

              {/* Variability */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Market Volatility</label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(scenario.variabilityMultiplier * 100)}%
                  </span>
                </div>
                <Slider
                  value={[scenario.variabilityMultiplier * 100]}
                  onValueChange={([v]) => setScenario({ ...scenario, variabilityMultiplier: v / 100 })}
                  min={50}
                  max={200}
                  step={10}
                />
                <p className="text-xs text-muted-foreground">
                  Higher volatility = more unpredictable demand
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={runSimulation} disabled={isSimulating} className="flex-1 gap-2">
                  {isSimulating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sliders className="w-4 h-4" />
                  )}
                  Simulate
                </Button>
                <Button variant="outline" onClick={resetScenario}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {simulatedAnalysis && baselineAnalysis && (
              <>
                {/* Risk Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Impact Analysis</CardTitle>
                    <CardDescription>
                      Comparing baseline vs. simulated scenario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-8">
                      {(['understockRisk', 'overstockRisk', 'deadInventoryRisk'] as const).map((key) => {
                        const label = key === 'understockRisk' ? 'Understock' : key === 'overstockRisk' ? 'Overstock' : 'Dead Stock';
                        const change = getRiskChange(simulatedAnalysis[key], baselineAnalysis[key]);
                        const ChangeIcon = change.icon;
                        
                        return (
                          <div key={key} className="text-center space-y-4">
                            <RiskGauge value={simulatedAnalysis[key]} label={label} />
                            <div className={`flex items-center justify-center gap-1 ${change.color}`}>
                              <ChangeIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">{change.text}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Baseline: {baselineAnalysis[key]}%
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Projection Chart */}
                <InventoryChart
                  data={simulatedAnalysis.simulationResults}
                  reorderPoint={selectedSku?.reorderPoint}
                  title="Simulated 90-Day Inventory Projection"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

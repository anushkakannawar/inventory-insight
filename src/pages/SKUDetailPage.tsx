import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, TrendingUp, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRiskExplanation, getRiskLevel } from '@/lib/simulation';

export default function SKUDetailPage() {
  const { skuId } = useParams<{ skuId: string }>();
  const navigate = useNavigate();
  const { skus, getAnalysis } = useInventory();

  const sku = skus.find((s) => s.id === skuId);
  const analysis = skuId ? getAnalysis(skuId) : undefined;

  if (!sku) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">SKU Not Found</h1>
          <p className="text-muted-foreground mb-8">The requested SKU could not be found.</p>
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const explanation = analysis ? getRiskExplanation(analysis, sku) : '';
  const overallRisk = analysis
    ? Math.max(analysis.understockRisk, analysis.overstockRisk, analysis.deadInventoryRisk)
    : 0;
  const overallLevel = getRiskLevel(overallRisk);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{sku.name || sku.id}</h1>
                <Badge
                  variant="outline"
                  className={
                    overallLevel === 'high'
                      ? 'border-risk-high text-risk-high'
                      : overallLevel === 'medium'
                      ? 'border-risk-medium text-risk-medium'
                      : 'border-risk-low text-risk-low'
                  }
                >
                  {overallLevel === 'high' ? 'High Risk' : overallLevel === 'medium' ? 'Moderate' : 'Healthy'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">SKU: {sku.id}</p>
            </div>
          </div>
          <Link to="/simulator">
            <Button variant="outline">Run What-If Analysis</Button>
          </Link>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{sku.currentInventory.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Current Stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{sku.dailySalesRate}</p>
              <p className="text-sm text-muted-foreground">Daily Sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{analysis?.daysOfSupply ?? '-'}</p>
              <p className="text-sm text-muted-foreground">Days of Supply</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">${sku.unitCost}</p>
              <p className="text-sm text-muted-foreground">Unit Cost</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Analysis */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Risk Gauges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around py-4">
                  <RiskGauge value={analysis.understockRisk} label="Understock" size="lg" />
                  <RiskGauge value={analysis.overstockRisk} label="Overstock" size="lg" />
                  <RiskGauge value={analysis.deadInventoryRisk} label="Dead Stock" size="lg" />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{explanation}</p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Safety Stock</p>
                    <p className="text-2xl font-bold">{analysis.safetyStock} units</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Optimal Reorder Point</p>
                    <p className="text-2xl font-bold">{analysis.optimalReorderPoint} units</p>
                  </div>
                </div>

                {analysis.projectedStockout && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-risk-high/10 border border-risk-high/20">
                    <AlertTriangle className="w-5 h-5 text-risk-high" />
                    <span className="text-sm">
                      Projected stockout in <strong>{analysis.projectedStockout} days</strong> without reorder
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Simulation Chart */}
        {analysis && (
          <InventoryChart
            data={analysis.simulationResults}
            reorderPoint={sku.reorderPoint}
            title="90-Day Inventory Projection (Monte Carlo Simulation)"
          />
        )}

        {/* SKU Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              SKU Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Lead Time</p>
                <p className="text-lg font-medium">{sku.leadTimeDays} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lead Time Variability</p>
                <p className="text-lg font-medium">±{sku.leadTimeVariability} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sales Variability</p>
                <p className="text-lg font-medium">{sku.salesVariability}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reorder Point</p>
                <p className="text-lg font-medium">{sku.reorderPoint} units</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reorder Quantity</p>
                <p className="text-lg font-medium">{sku.reorderQuantity} units</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Holding Cost</p>
                <p className="text-lg font-medium">{sku.holdingCostPercent}% / year</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-lg font-medium">
                  ${(sku.currentInventory * sku.unitCost).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

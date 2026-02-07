import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { getRiskLevel } from '@/lib/simulation';
import { cn } from '@/lib/utils';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { skus, analyses } = useInventory();

  const ids = searchParams.get('ids')?.split(',') || [];
  const selectedSkus = skus.filter(s => ids.includes(s.id));

  if (selectedSkus.length < 2) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Invalid Comparison</h1>
          <p className="text-muted-foreground mb-8">Please select at least 2 SKUs to compare.</p>
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const riskBadgeStyles = {
    low: 'bg-risk-low/10 text-risk-low border-risk-low/20',
    medium: 'bg-risk-medium/10 text-risk-medium border-risk-medium/20',
    high: 'bg-risk-high/10 text-risk-high border-risk-high/20',
  };

  const riskIcons = {
    low: CheckCircle,
    medium: AlertTriangle,
    high: AlertCircle,
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SKU Comparison</h1>
            <p className="text-muted-foreground mt-1">Side-by-side analysis of {selectedSkus.length} inventory items</p>
          </div>
        </div>

        {/* Comparison Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {selectedSkus.map((sku) => {
            const analysis = analyses.get(sku.id);
            const understockLevel = analysis ? getRiskLevel(analysis.understockRisk) : 'low';
            const overstockLevel = analysis ? getRiskLevel(analysis.overstockRisk) : 'low';
            const deadStockLevel = analysis ? getRiskLevel(analysis.deadInventoryRisk) : 'low';

            const UnderstockIcon = riskIcons[understockLevel];
            const OverstockIcon = riskIcons[overstockLevel];
            const DeadStockIcon = riskIcons[deadStockLevel];

            return (
              <motion.div
                key={sku.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="h-full">
                  {/* SKU Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl">{sku.name || sku.id}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">SKU: {sku.id}</p>
                      </div>
                      <Link to={`/sku/${sku.id}`}>
                        <Button variant="ghost" size="sm">
                          Details →
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-6">
                    {/* Key Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Stock</span>
                        <span className="font-semibold">{sku.currentInventory.toLocaleString()} units</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Daily Sales Rate</span>
                        <span className="font-semibold">{sku.dailySalesRate} units/day</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Unit Cost</span>
                        <span className="font-semibold">${sku.unitCost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Lead Time</span>
                        <span className="font-semibold">{sku.leadTimeDays} days</span>
                      </div>
                    </div>

                    <div className="border-t"></div>

                    {/* Risk Analysis */}
                    {analysis ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Understock Risk</span>
                          <Badge variant="outline" className={cn('gap-1', riskBadgeStyles[understockLevel])}>
                            <UnderstockIcon className="h-3 w-3" />
                            {analysis.understockRisk}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Overstock Risk</span>
                          <Badge variant="outline" className={cn('gap-1', riskBadgeStyles[overstockLevel])}>
                            <OverstockIcon className="h-3 w-3" />
                            {analysis.overstockRisk}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Dead Stock Risk</span>
                          <Badge variant="outline" className={cn('gap-1', riskBadgeStyles[deadStockLevel])}>
                            <DeadStockIcon className="h-3 w-3" />
                            {analysis.deadInventoryRisk}%
                          </Badge>
                        </div>

                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Days of Supply</span>
                            <span className="font-semibold">{analysis.daysOfSupply} days</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">Safety Stock</span>
                            <span className="font-semibold">{analysis.safetyStock} units</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">Reorder Point</span>
                            <span className="font-semibold">{analysis.optimalReorderPoint} units</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Analysis pending...</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Risk Gauges Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Profile Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {selectedSkus.map((sku) => {
                const analysis = analyses.get(sku.id);
                if (!analysis) return null;

                return (
                  <div key={sku.id} className="flex flex-col items-center gap-4">
                    <div className="text-center">
                      <p className="font-semibold text-sm mb-2">{sku.name || sku.id}</p>
                      <div className="flex justify-center gap-4">
                        <div className="flex flex-col items-center">
                          <RiskGauge value={analysis.understockRisk} label="Understock" size="md" />
                        </div>
                        <div className="flex flex-col items-center">
                          <RiskGauge value={analysis.overstockRisk} label="Overstock" size="md" />
                        </div>
                        <div className="flex flex-col items-center">
                          <RiskGauge value={analysis.deadInventoryRisk} label="Dead Stock" size="md" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

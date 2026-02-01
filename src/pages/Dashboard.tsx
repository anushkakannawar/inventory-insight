import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingDown,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SKUTable } from '@/components/dashboard/SKUTable';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { skus, analyses, metrics, isLoading, loadSampleData, runAnalysis } = useInventory();

  useEffect(() => {
    if (skus.length > 0 && analyses.size === 0 && !isLoading) {
      runAnalysis();
    }
  }, [skus, analyses.size, isLoading, runAnalysis]);

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
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome to Inventory Risk Predictor</h1>
              <p className="text-muted-foreground">
                Upload your inventory data or generate sample data to get started with AI-powered risk analysis.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/input">
                <Button size="lg" className="gap-2">
                  <Package className="w-4 h-4" />
                  Add Inventory Data
                </Button>
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

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Running Monte Carlo simulation...</p>
          <p className="text-muted-foreground">Analyzing risk across {skus.length} SKUs</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered inventory risk analysis for {skus.length} SKUs
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/simulator">
              <Button variant="outline" className="gap-2">
                Run What-If Analysis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total SKUs"
              value={metrics.totalSKUs}
              subtitle="Being monitored"
              icon={Package}
            />
            <MetricCard
              title="At Risk"
              value={metrics.atRiskSKUs}
              subtitle="Need attention"
              icon={AlertTriangle}
              variant={metrics.atRiskSKUs > 0 ? 'warning' : 'success'}
            />
            <MetricCard
              title="Healthy"
              value={metrics.healthySKUs}
              subtitle="Low risk items"
              icon={CheckCircle}
              variant="success"
            />
            <MetricCard
              title="Inventory Value"
              value={`$${metrics.totalInventoryValue.toLocaleString()}`}
              subtitle="Total stock value"
              icon={DollarSign}
            />
          </div>
        )}

        {/* Risk Overview */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Overall Risk Assessment</h2>
                <p className="text-muted-foreground max-w-md">
                  Based on Monte Carlo simulation of 1,000 scenarios over 90 days,
                  here's your portfolio risk breakdown.
                </p>
                {metrics.projectedLosses > 0 && (
                  <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-risk-high/10 border border-risk-high/20">
                    <TrendingDown className="w-5 h-5 text-risk-high" />
                    <span className="text-sm">
                      Projected losses from inventory risk:{' '}
                      <strong className="text-risk-high">${metrics.projectedLosses.toLocaleString()}</strong>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-8 flex-wrap justify-center">
                <RiskGauge value={metrics.averageUnderstockRisk} label="Understock Risk" />
                <RiskGauge value={metrics.averageOverstockRisk} label="Overstock Risk" />
                <RiskGauge value={metrics.averageDeadInventoryRisk} label="Dead Stock Risk" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <RiskDistributionChart
            skus={skus}
            analyses={analyses}
            riskType="understock"
            title="Understock Risk by SKU"
          />
          <RiskDistributionChart
            skus={skus}
            analyses={analyses}
            riskType="overstock"
            title="Overstock Risk by SKU"
          />
          <RiskDistributionChart
            skus={skus}
            analyses={analyses}
            riskType="deadInventory"
            title="Dead Stock Risk by SKU"
          />
        </div>

        {/* SKU Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Inventory Details</h2>
          <SKUTable skus={skus} analyses={analyses} />
        </div>
      </div>
    </AppLayout>
  );
}

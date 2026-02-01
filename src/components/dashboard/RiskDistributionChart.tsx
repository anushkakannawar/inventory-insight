import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { SKUData, RiskAnalysis } from '@/types/inventory';
import { getRiskLevel } from '@/lib/simulation';
import { motion } from 'framer-motion';

interface RiskDistributionChartProps {
  skus: SKUData[];
  analyses: Map<string, RiskAnalysis>;
  riskType: 'understock' | 'overstock' | 'deadInventory';
  title: string;
}

const riskColors = {
  low: 'hsl(142 71% 45%)',
  medium: 'hsl(38 92% 50%)',
  high: 'hsl(0 84% 60%)',
};

export function RiskDistributionChart({ skus, analyses, riskType, title }: RiskDistributionChartProps) {
  const chartData = useMemo(() => {
    return skus.map((sku) => {
      const analysis = analyses.get(sku.id);
      let riskValue = 0;
      
      if (analysis) {
        switch (riskType) {
          case 'understock':
            riskValue = analysis.understockRisk;
            break;
          case 'overstock':
            riskValue = analysis.overstockRisk;
            break;
          case 'deadInventory':
            riskValue = analysis.deadInventoryRisk;
            break;
        }
      }
      
      return {
        name: sku.id.replace('SKU-', ''),
        value: riskValue,
        level: getRiskLevel(riskValue),
      };
    });
  }, [skus, analyses, riskType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 16% 47%)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 16% 47%)', fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0 0% 100%)',
                border: '1px solid hsl(214 32% 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [`${value}%`, 'Risk']}
              labelFormatter={(label) => `SKU-${label}`}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={riskColors[entry.level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

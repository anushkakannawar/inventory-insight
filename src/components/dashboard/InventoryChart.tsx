import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import { SimulationResult } from '@/types/inventory';
import { motion } from 'framer-motion';

interface InventoryChartProps {
  data: SimulationResult[];
  reorderPoint?: number;
  title?: string;
}

export function InventoryChart({ data, reorderPoint, title }: InventoryChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      day: d.day,
      inventory: d.inventoryLevel,
      demand: d.demand,
    }));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      )}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inventoryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 16% 47%)', fontSize: 12 }}
              label={{ value: 'Days', position: 'insideBottomRight', offset: -5, fill: 'hsl(215 16% 47%)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 16% 47%)', fontSize: 12 }}
              label={{ value: 'Units', angle: -90, position: 'insideLeft', fill: 'hsl(215 16% 47%)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0 0% 100%)',
                border: '1px solid hsl(214 32% 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelFormatter={(value) => `Day ${value}`}
            />
            {reorderPoint && (
              <ReferenceLine
                y={reorderPoint}
                stroke="hsl(38 92% 50%)"
                strokeDasharray="5 5"
                label={{
                  value: 'Reorder Point',
                  position: 'right',
                  fill: 'hsl(38 92% 50%)',
                  fontSize: 12,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="inventory"
              stroke="hsl(217 91% 60%)"
              strokeWidth={2}
              fill="url(#inventoryGradient)"
              name="Inventory"
            />
            <Area
              type="monotone"
              dataKey="demand"
              stroke="hsl(142 71% 45%)"
              strokeWidth={2}
              fill="url(#demandGradient)"
              name="Daily Demand"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-card',
  success: 'bg-risk-low/10 border-risk-low/20',
  warning: 'bg-risk-medium/10 border-risk-medium/20',
  danger: 'bg-risk-high/10 border-risk-high/20',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-risk-low/20 text-risk-low',
  warning: 'bg-risk-medium/20 text-risk-medium',
  danger: 'bg-risk-high/20 text-risk-high',
};

export function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          <span className={trend.isPositive ? 'text-risk-low' : 'text-risk-high'}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

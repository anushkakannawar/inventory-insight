import { motion } from 'framer-motion';
import { getRiskLevel } from '@/lib/simulation';
import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskGauge({ value, label, size = 'md' }: RiskGaugeProps) {
  const riskLevel = getRiskLevel(value);
  
  const sizeStyles = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-28 h-28', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-base' },
  };

  const colorStyles = {
    low: 'text-risk-low',
    medium: 'text-risk-medium',
    high: 'text-risk-high',
  };

  const bgStyles = {
    low: 'stroke-risk-low',
    medium: 'stroke-risk-medium',
    high: 'stroke-risk-high',
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizeStyles[size].container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
            className="stroke-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={bgStyles[riskLevel]}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', sizeStyles[size].text, colorStyles[riskLevel])}>
            {value}%
          </span>
        </div>
      </div>
      <span className={cn('font-medium text-center', sizeStyles[size].label)}>{label}</span>
    </div>
  );
}

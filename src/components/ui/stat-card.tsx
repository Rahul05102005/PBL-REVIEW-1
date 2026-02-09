import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: {
    container: 'bg-card',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  primary: {
    container: 'bg-primary/5 border-primary/20',
    iconBg: 'bg-primary',
    iconColor: 'text-primary-foreground',
  },
  accent: {
    container: 'bg-accent/5 border-accent/20',
    iconBg: 'bg-accent',
    iconColor: 'text-accent-foreground',
  },
  success: {
    container: 'bg-success/5 border-success/20',
    iconBg: 'bg-success',
    iconColor: 'text-success-foreground',
  },
  warning: {
    container: 'bg-warning/5 border-warning/20',
    iconBg: 'bg-warning',
    iconColor: 'text-warning-foreground',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'stat-card relative overflow-hidden',
        styles.container,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="stat-label">{title}</p>
          <p className="stat-value animate-counter-up">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last semester</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            styles.iconBg
          )}
        >
          <Icon className={cn('h-6 w-6', styles.iconColor)} />
        </div>
      </div>
    </div>
  );
};

export { StatCard };

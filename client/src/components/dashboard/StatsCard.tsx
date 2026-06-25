import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  gradient?: string;
  iconBg?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, trendLabel, gradient, iconBg }: StatsCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isNeutral = trend === undefined || trend === 0;

  return (
    <div className="stat-card group relative overflow-hidden">
      {/* Background gradient */}
      {gradient && (
        <div className={cn('absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300', gradient)} />
      )}

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>

          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              isPositive ? 'text-emerald-600 dark:text-emerald-400' :
              isNegative ? 'text-red-500 dark:text-red-400' :
              'text-muted-foreground'
            )}>
              {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
              {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
              {isNeutral && <Minus className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{trend}% {trendLabel || 'vs last month'}</span>
            </div>
          )}
        </div>

        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          iconBg || 'bg-primary/10'
        )}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

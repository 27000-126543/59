import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  color?: 'brown' | 'gold' | 'jade' | 'crimson';
  className?: string;
}

const colorMap = {
  brown: 'bg-museum-brown-50 text-museum-brown-700 border-museum-brown-200',
  gold: 'bg-museum-gold-50 text-museum-gold-700 border-museum-gold-200',
  jade: 'bg-green-50 text-museum-jade border-green-200',
  crimson: 'bg-red-50 text-museum-crimson border-red-200',
};

const iconBgMap = {
  brown: 'bg-museum-brown-100 text-museum-brown-600',
  gold: 'bg-museum-gold-100 text-museum-gold-600',
  jade: 'bg-green-100 text-museum-jade',
  crimson: 'bg-red-100 text-museum-crimson',
};

export default function DataCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'brown',
  className,
}: DataCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-6 shadow-museum transition-all hover:shadow-museum-hover',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-museum-brown-500">{title}</p>
          <p className="mt-3 text-3xl font-bold font-serif text-museum-brown-900">
            {value}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {trend !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold',
                  trend >= 0 ? 'text-museum-jade' : 'text-museum-crimson'
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {Math.abs(trend)}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-museum-brown-400">{subtitle}</span>
            )}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              iconBgMap[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className={cn('mt-4 h-1 rounded-full', colorMap[color])} />
    </div>
  );
}

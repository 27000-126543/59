import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gold'
  | 'brown';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-museum-brown-100 text-museum-brown-700',
  success: 'bg-green-100 text-museum-jade',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-museum-crimson',
  info: 'bg-blue-100 text-blue-700',
  gold: 'bg-museum-gold-100 text-museum-gold-700',
  brown: 'bg-museum-brown-100 text-museum-brown-700',
};

export default function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

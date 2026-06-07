import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = '暂无数据',
  description = '这里还没有内容',
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-museum-brown-50">
        {icon || <Inbox className="h-10 w-10 text-museum-brown-400" />}
      </div>
      <h3 className="mt-6 text-lg font-semibold text-museum-brown-800 font-serif">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-museum-brown-500 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}

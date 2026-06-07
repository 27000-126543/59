import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-museum-brown-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full rounded-xl bg-white shadow-2xl animate-slide-in-up',
          sizeMap[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-museum-brown-100 px-6 py-4">
            <h3 className="text-lg font-semibold font-serif text-museum-brown-900">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-museum-brown-500 transition-colors hover:bg-museum-brown-50 hover:text-museum-brown-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className={cn('px-6 py-5', title ? '' : 'pt-6')}>{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-museum-brown-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

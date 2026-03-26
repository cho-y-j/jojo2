import { type ReactNode } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#E8F9EF] text-[#00C471]',
  warning: 'bg-[#FFF3E8] text-[#FF6B35]',
  error: 'bg-[#FFEAEC] text-[#F04452]',
};

const defaultIcons: Record<BadgeVariant, ReactNode> = {
  success: <CheckCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  error: <XCircle className="w-4 h-4" />,
};

function Badge({ variant, children, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5',
        'rounded-full text-[13px] font-semibold break-keep',
        variantStyles[variant],
        className,
      )}
    >
      {icon !== undefined ? icon : defaultIcons[variant]}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };

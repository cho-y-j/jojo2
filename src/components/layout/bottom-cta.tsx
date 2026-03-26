'use client';

import { type ReactNode } from 'react';
import { TossButton, type TossButtonVariant } from '@/components/ui/toss-button';
import { cn } from '@/lib/utils';

interface BottomCTAProps {
  children: ReactNode;
  disabled?: boolean;
  variant?: TossButtonVariant;
  onClick?: () => void;
  className?: string;
}

function BottomCTA({
  children,
  disabled = false,
  variant = 'primary',
  onClick,
  className,
}: BottomCTAProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'px-5 py-4',
        'bg-white/80 backdrop-blur-[20px]',
        'border-t border-gray-100',
        'pb-[calc(16px+env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <TossButton
        variant={variant}
        disabled={disabled}
        onClick={onClick}
        fullWidth
      >
        {children}
      </TossButton>
    </div>
  );
}

export { BottomCTA, type BottomCTAProps };

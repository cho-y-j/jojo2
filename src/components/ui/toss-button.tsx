'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type TossButtonVariant = 'primary' | 'secondary' | 'ghost' | 'disabled';

interface TossButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: TossButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<TossButtonVariant, string> = {
  primary: 'bg-[#3182F6] text-white',
  secondary: 'bg-[#E8F0FE] text-[#3182F6]',
  ghost: 'bg-transparent text-[#4E5968] border border-[#E5E8EB]',
  disabled: 'bg-[#F2F4F6] text-[#8B95A1] cursor-not-allowed',
};

const TossButton = forwardRef<HTMLButtonElement, TossButtonProps>(
  ({ variant = 'primary', fullWidth = true, className, disabled, children, ...props }, ref) => {
    const resolvedVariant = disabled ? 'disabled' : variant;

    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : { scale: 0.98, opacity: 0.8 }}
        transition={{ duration: 0.1 }}
        disabled={disabled}
        className={cn(
          'h-[52px] rounded-[12px] text-[16px] font-semibold leading-[1] break-keep',
          'transition-colors duration-200',
          fullWidth && 'w-full',
          variantStyles[resolvedVariant],
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

TossButton.displayName = 'TossButton';

export { TossButton, type TossButtonProps, type TossButtonVariant };

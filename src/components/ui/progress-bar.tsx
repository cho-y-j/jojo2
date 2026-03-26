'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  className?: string;
}

function ProgressBar({ currentStep, totalSteps = 3, className }: ProgressBarProps) {
  return (
    <div className={cn('flex items-center gap-2 w-full px-5', className)}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepIndex = i + 1;
        const isActive = stepIndex <= currentStep;

        return (
          <motion.div
            key={stepIndex}
            className={cn(
              'h-[4px] flex-1 rounded-full',
              isActive ? 'bg-[#3182F6]' : 'bg-[#F2F4F6]',
            )}
            initial={false}
            animate={{
              backgroundColor: isActive ? '#3182F6' : '#F2F4F6',
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

export { ProgressBar, type ProgressBarProps };

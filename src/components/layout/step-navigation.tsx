'use client';

import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepNavigationProps {
  title: string;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  className?: string;
}

function StepNavigation({
  title,
  currentStep,
  totalSteps,
  onBack,
  className,
}: StepNavigationProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 h-[56px] bg-white',
        className,
      )}
    >
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 -ml-1"
        aria-label="뒤로가기"
      >
        <ChevronLeft className="w-6 h-6 text-[#191F28]" />
      </button>

      <h1 className="text-[17px] font-semibold text-[#191F28] break-keep">
        {title}
      </h1>

      {currentStep != null && totalSteps != null ? (
        <span className="text-[14px] text-[#8B95A1] min-w-[32px] text-right">
          {currentStep}/{totalSteps}
        </span>
      ) : (
        <span className="min-w-[32px]" />
      )}
    </div>
  );
}

export { StepNavigation, type StepNavigationProps };

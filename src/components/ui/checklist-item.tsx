'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

function ChecklistItem({ label, checked, onChange, className }: ChecklistItemProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'flex items-center gap-3 w-full py-3 text-left',
        className,
      )}
    >
      <motion.div
        className={cn(
          'flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0',
          checked
            ? 'bg-[#00C471] border-[#00C471]'
            : 'bg-white border-[#E5E8EB]',
        )}
        animate={{
          scale: checked ? [1, 1.15, 1] : 1,
          backgroundColor: checked ? '#00C471' : '#FFFFFF',
          borderColor: checked ? '#00C471' : '#E5E8EB',
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <span
        className={cn(
          'text-[15px] leading-[1.6] break-keep',
          checked ? 'text-[#191F28]' : 'text-[#4E5968]',
        )}
      >
        {label}
      </span>
    </button>
  );
}

export { ChecklistItem, type ChecklistItemProps };

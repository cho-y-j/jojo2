'use client';

import { forwardRef, useState, useId, type InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TossInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
}

const TossInput = forwardRef<HTMLInputElement, TossInputProps>(
  ({ label, error, className, value, defaultValue, onFocus, onBlur, onChange, ...props }, ref) => {
    const id = useId();
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(value || defaultValue),
    );

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          id={id}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'peer w-full h-[52px] px-4 pt-4 rounded-[12px] text-[15px] text-[#191F28]',
            'outline-none transition-all duration-200',
            'placeholder-transparent',
            !error && !isFocused && 'border border-[#E5E8EB] bg-white',
            !error && isFocused && 'border-2 border-[#3182F6] bg-[#FAFBFC]',
            error && 'border-2 border-[#F04452] bg-white',
            className,
          )}
          placeholder={label}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(e.target.value.length > 0);
            onChange?.(e);
          }}
          {...props}
        />
        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            top: isFloating ? 8 : '50%',
            y: isFloating ? 0 : '-50%',
            fontSize: isFloating ? 12 : 15,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'absolute left-4 pointer-events-none origin-left',
            'transition-colors duration-200',
            error
              ? 'text-[#F04452]'
              : isFocused
                ? 'text-[#3182F6]'
                : 'text-[#8B95A1]',
          )}
        >
          {label}
        </motion.label>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5 ml-1 text-[13px] text-[#F04452]"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

TossInput.displayName = 'TossInput';

export { TossInput, type TossInputProps };

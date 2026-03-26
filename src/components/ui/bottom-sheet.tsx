'use client';

import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sheetVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function BottomSheet({ isOpen, onClose, children, title, className }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-white rounded-t-[20px] px-5 pt-6',
              'pb-[calc(24px+env(safe-area-inset-bottom))]',
              'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
              className,
            )}
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-4">
              <div className="w-9 h-1 rounded-full bg-[#E5E8EB]" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-semibold text-[#191F28] break-keep">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-[#8B95A1]" />
                </button>
              </div>
            )}

            {/* Content */}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { BottomSheet, type BottomSheetProps };

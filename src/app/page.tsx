'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PawPrint, Plane } from 'lucide-react';
import { BottomCTA } from '@/components/layout';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' as const }}
      className="flex flex-col min-h-screen bg-white"
    >
      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-[120px]">
        {/* Icon group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <PawPrint className="w-[56px] h-[56px] text-[#3182F6]" strokeWidth={1.8} />
          <Plane
            className="w-[32px] h-[32px] text-[#3182F6] absolute -top-2 -right-4 rotate-[-15deg]"
            strokeWidth={1.8}
          />
        </motion.div>

        {/* App name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[32px] font-bold text-[#191F28] mb-6"
        >
          PetPort
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-[22px] font-bold text-[#191F28] leading-[1.4] text-center break-keep whitespace-pre-line mb-4"
        >
          {'반려동물 해외여행,\nAI가 모든 걸 준비해드려요'}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-[15px] text-[#4E5968] leading-[1.6] text-center break-keep whitespace-pre-line"
        >
          {'사진 한 장이면 검역 서류부터\n항공사 규정까지 한 번에 확인해요'}
        </motion.p>
      </div>

      {/* Bottom CTA */}
      <BottomCTA onClick={() => router.push('/step/flight')}>
        시작하기
      </BottomCTA>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { ChecklistItem } from '@/components/ui';

const documentItems = [
  { id: 'microchip', label: '마이크로칩 삽입 확인서' },
  { id: 'rabies', label: '광견병 예방접종증' },
  { id: 'export-cert', label: '수출검역증명서' },
  { id: 'japan-notice', label: '일본 동물 검역소 사전 신고서' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function DocumentsCheckPage() {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <StepNavigation
          title="서류 확인"
          currentStep={6}
          totalSteps={9}
          onBack={() => router.push('/result/documents')}
        />

        <main className="flex-1 px-5 pt-6 pb-[120px]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            {/* Heading */}
            <motion.h2
              variants={itemVariants}
              className="text-[26px] font-bold text-[#191F28] leading-[1.4] break-keep mb-2"
            >
              이미 준비가 된{'\n'}서류가 있으신가요?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-[15px] text-[#4E5968] leading-[1.6] mb-8 break-keep"
            >
              서류를 촬영해 간편하게 확인해보세요.
            </motion.p>

            {/* Upload area */}
            <motion.div variants={itemVariants} className="mb-8">
              <button
                type="button"
                className="w-full h-[180px] rounded-[16px] border-2 border-dashed border-[#D1D6DB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-3 active:bg-[#F2F4F6] transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-[#E5E8EB] flex items-center justify-center">
                  <Camera className="w-7 h-7 text-[#8B95A1]" />
                </div>
                <span className="text-[15px] text-[#8B95A1] font-medium break-keep">
                  서류 촬영하기
                </span>
              </button>
            </motion.div>

            {/* Checklist */}
            <motion.div variants={itemVariants}>
              <div className="flex flex-col">
                {documentItems.map((doc) => (
                  <div
                    key={doc.id}
                    className="border-b border-[#F2F4F6] last:border-b-0"
                  >
                    <ChecklistItem
                      label={doc.label}
                      checked={!!checkedItems[doc.id]}
                      onChange={() => toggleCheck(doc.id)}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </main>

        <BottomCTA onClick={() => router.push('/result/seat')}>
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

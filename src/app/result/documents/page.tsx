'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { Card } from '@/components/ui';

interface DocumentEntry {
  id: string;
  name: string;
  statusLabel: string;
  statusColor: 'green' | 'orange';
}

const documents: DocumentEntry[] = [
  {
    id: 'microchip',
    name: '마이크로칩 삽입 확인서',
    statusLabel: '필요 여부 ✓',
    statusColor: 'green',
  },
  {
    id: 'rabies-vaccine',
    name: '광견병 예방접종증 접종',
    statusLabel: '필요 여부 ✓',
    statusColor: 'green',
  },
  {
    id: 'antibody',
    name: '광견병 항체가 검사 결과서',
    statusLabel: '필요 여부 ✓',
    statusColor: 'green',
  },
  {
    id: 'japan-notice',
    name: '일본 동물검역소 사전 신고서',
    statusLabel: '필요 여부 ✓',
    statusColor: 'green',
  },
  {
    id: 'health-cert',
    name: '건강증명서(수의사 발급)',
    statusLabel: '출발 1주 전',
    statusColor: 'orange',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

const badgeStyles = {
  green: {
    bg: 'bg-[#E8F9EF]',
    text: 'text-[#00C471]',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  orange: {
    bg: 'bg-[#FFF3E8]',
    text: 'text-[#FF6B35]',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
};

export default function DocumentsPage() {
  const router = useRouter();

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <StepNavigation
          title="필요 서류"
          currentStep={5}
          totalSteps={9}
          onBack={() => router.push('/result')}
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
              className="text-[26px] font-bold text-[#191F28] leading-[1.4] break-keep mb-8"
            >
              이런 서류가 필요해요
            </motion.h2>

            {/* Document list */}
            <div className="flex flex-col gap-3">
              {documents.map((doc) => {
                const style = badgeStyles[doc.statusColor];
                return (
                  <motion.div key={doc.id} variants={itemVariants}>
                    <Card className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${style.bg} flex-shrink-0`}>
                          <span className={style.text}>{style.icon}</span>
                        </div>
                        <span className="text-[15px] font-medium text-[#191F28] break-keep">
                          {doc.name}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold flex-shrink-0 ml-2 ${style.bg} ${style.text}`}
                      >
                        {doc.statusLabel}
                      </span>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </main>

        <BottomCTA onClick={() => router.push('/result/documents-check')}>
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

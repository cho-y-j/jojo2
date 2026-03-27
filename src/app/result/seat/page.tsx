'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { Card } from '@/components/ui';
import SeatMap from '@/components/features/SeatMap';
import { useAnalysisStore } from '@/stores/analysis-store';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function SeatPage() {
  const router = useRouter();
  const flightInfo = useAnalysisStore((s) => s.flightInfo);
  const fullAnalysis = useAnalysisStore((s) => s.fullAnalysis);

  const airlineCode = fullAnalysis?.flight?.airline_code ?? flightInfo?.airline_code ?? 'KE';
  const airlineName = fullAnalysis?.flight?.airline_name_ko ?? flightInfo?.airline_name_ko ?? '대한항공';
  const aircraftType = fullAnalysis?.aircraftType;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <StepNavigation
          title="좌석 추천"
          currentStep={7}
          totalSteps={9}
          onBack={() => router.push('/result/documents-check')}
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
              className="text-[22px] font-bold text-[#191F28] leading-[1.4] break-keep mb-2"
            >
              추천 좌석을{'\n'}확인해보세요
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-[15px] text-[#4E5968] leading-[1.6] break-keep mb-6"
            >
              {airlineName} 기종별 반려동물 좌석을 안내해요
            </motion.p>

            {/* Seat map component */}
            <motion.div variants={itemVariants} className="mb-6">
              <SeatMap airlineCode={airlineCode} aircraftType={aircraftType} />
            </motion.div>

            {/* Info cards */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Card className="bg-[#E8F0FE] border-none shadow-none">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#3182F6] mt-0.5 flex-shrink-0" />
                  <p className="text-[15px] text-[#191F28] leading-[1.6] break-keep">
                    케이지는 앞좌석 아래에 보관해요
                  </p>
                </div>
              </Card>
              <Card className="bg-[#FFF3E8] border-none shadow-none">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                  <p className="text-[15px] text-[#191F28] leading-[1.6] break-keep">
                    비상구 좌석은 반려동물과 함께 앉을 수 없어요
                  </p>
                </div>
              </Card>
              {airlineCode === 'OZ' && (
                <Card className="bg-[#FFEAEC] border-none shadow-none">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#F04452] mt-0.5 flex-shrink-0" />
                    <p className="text-[15px] text-[#191F28] leading-[1.6] break-keep">
                      아시아나는 앞 10열, 비상구, 벌크헤드, 복도석, 엑스트라레그룸 불가예요. 윈도우석만 가능해요.
                    </p>
                  </div>
                </Card>
              )}
              {airlineCode === 'KE' && (
                <Card className="bg-[#E8F9EF] border-none shadow-none">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#00C471] mt-0.5 flex-shrink-0" />
                    <p className="text-[15px] text-[#191F28] leading-[1.6] break-keep">
                      대한항공은 콜센터에서 좌석을 배정해요. 추가 좌석 구매 시 옆자리에 캐리어를 놓을 수 있어요.
                    </p>
                  </div>
                </Card>
              )}
              {['7C', 'LJ', 'TW', 'BX'].includes(airlineCode) && (
                <Card className="bg-[#E8F0FE] border-none shadow-none">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#3182F6] mt-0.5 flex-shrink-0" />
                    <p className="text-[15px] text-[#191F28] leading-[1.6] break-keep">
                      LCC는 좌석 피치가 좁아요. 소형 캐리어(높이 23cm 이하)만 가능해요.
                    </p>
                  </div>
                </Card>
              )}
            </motion.div>
          </motion.div>
        </main>

        <BottomCTA onClick={() => router.push('/result/airport')}>
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

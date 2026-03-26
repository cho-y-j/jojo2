'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { Card } from '@/components/ui';

const ROWS = 15;
const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F'];
const RECOMMENDED = ['A', 'F'];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

function SeatCell({ column, row }: { column: string; row: number }) {
  const isRecommended = RECOMMENDED.includes(column);
  const isEmergency = row === 11;

  if (isEmergency) {
    return (
      <div className="w-[32px] h-[28px] rounded-[4px] bg-[#F2F4F6] flex items-center justify-center">
        <span className="text-[9px] text-[#D1D6DB]">-</span>
      </div>
    );
  }

  return (
    <div
      className={`w-[32px] h-[28px] rounded-[4px] flex items-center justify-center text-[10px] font-semibold ${
        isRecommended
          ? 'bg-[#3182F6] text-white'
          : 'bg-[#F2F4F6] text-[#D1D6DB]'
      }`}
    >
      {column}
    </div>
  );
}

export default function SeatPage() {
  const router = useRouter();
  const rows = Array.from({ length: ROWS }, (_, i) => i + 1);

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
              className="text-[26px] font-bold text-[#191F28] leading-[1.4] break-keep mb-8"
            >
              추천 좌석을{'\n'}확인해보세요
            </motion.h2>

            {/* Seat map */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="overflow-hidden">
                {/* Airplane nose */}
                <div className="flex justify-center mb-4">
                  <div className="w-[60px] h-[24px] bg-[#E5E8EB] rounded-t-full" />
                </div>

                {/* Column headers */}
                <div className="flex items-center justify-center gap-0 mb-2">
                  <div className="w-[28px]" />
                  {COLUMNS.slice(0, 3).map((col) => (
                    <div key={col} className="w-[32px] flex items-center justify-center mx-[2px]">
                      <span className={`text-[11px] font-bold ${RECOMMENDED.includes(col) ? 'text-[#3182F6]' : 'text-[#8B95A1]'}`}>
                        {col}
                      </span>
                    </div>
                  ))}
                  <div className="w-[20px]" />
                  {COLUMNS.slice(3).map((col) => (
                    <div key={col} className="w-[32px] flex items-center justify-center mx-[2px]">
                      <span className={`text-[11px] font-bold ${RECOMMENDED.includes(col) ? 'text-[#3182F6]' : 'text-[#8B95A1]'}`}>
                        {col}
                      </span>
                    </div>
                  ))}
                  <div className="w-[28px]" />
                </div>

                {/* Seat rows */}
                <div className="flex flex-col gap-[4px]">
                  {rows.map((row) => (
                    <div key={row} className="flex items-center justify-center gap-0">
                      {/* Row number left */}
                      <div className="w-[28px] flex items-center justify-end pr-2">
                        <span className="text-[10px] text-[#8B95A1]">{row}</span>
                      </div>
                      {/* Left seats A B C */}
                      <div className="flex gap-[4px]">
                        {COLUMNS.slice(0, 3).map((col) => (
                          <SeatCell key={col} column={col} row={row} />
                        ))}
                      </div>
                      {/* Aisle */}
                      <div className="w-[20px]" />
                      {/* Right seats D E F */}
                      <div className="flex gap-[4px]">
                        {COLUMNS.slice(3).map((col) => (
                          <SeatCell key={col} column={col} row={row} />
                        ))}
                      </div>
                      {/* Row number right */}
                      <div className="w-[28px] flex items-center pl-2">
                        <span className="text-[10px] text-[#8B95A1]">{row}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-[#F2F4F6]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-3 rounded-[2px] bg-[#3182F6]" />
                    <span className="text-[12px] text-[#4E5968]">추천 좌석</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-3 rounded-[2px] bg-[#F2F4F6]" />
                    <span className="text-[12px] text-[#4E5968]">일반 좌석</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Explanation */}
            <motion.p
              variants={itemVariants}
              className="text-[15px] text-[#4E5968] text-center leading-[1.6] break-keep mb-6"
            >
              반려동물과 함께라면 창가석(A, F)을 추천해요
            </motion.p>

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
                    비상구 좌석은 선택할 수 없어요
                  </p>
                </div>
              </Card>
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

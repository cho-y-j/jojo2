'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { Card, Badge } from '@/components/ui';
import { useAnalysisStore } from '@/stores/analysis-store';

const mockAnalysis = {
  pet: {
    animal_type: 'dog',
    breed_ko: '말티즈',
    breed_en: 'Maltese',
    estimated_weight_kg: 3.5,
    is_brachycephalic: false,
    size_category: 'small',
  },
  flight: {
    airline_code: 'KE',
    airline_name_ko: '대한항공',
    flight_number: 'KE713',
    departure_date: '2026-05-15',
    departure_airport: 'ICN',
    arrival_airport: 'NRT',
    destination_country_code: 'JP',
    destination_country_ko: '일본',
  },
  destination: {
    code: 'JP',
    nameKo: '일본',
    nameEn: 'Japan',
    officialSource: 'https://www.maff.go.jp',
  },
  transport: {
    mode: 'CABIN' as const,
    reason: '소형견으로 기내 반입 기준을 충족해요',
    airline_policy: {},
  },
  timeline: [],
  totalEstimatedCost: '약 350,000원',
  warnings: [],
};

const cageSizeByCategory: Record<string, string> = {
  small: '45 x 35 x 28cm',
  medium: '67 x 51 x 47cm',
  large: '91 x 61 x 66cm',
};

const feeByAirline: Record<string, string> = {
  KE: '50,000원',
  OZ: '50,000원',
};

const transportBadge: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  CABIN: { variant: 'success', label: '기내 반입 가능' },
  CABIN_ONLY: { variant: 'success', label: '기내 반입 가능' },
  CARGO: { variant: 'warning', label: '화물칸 운송' },
  NOT_AVAILABLE: { variant: 'error', label: '기내 반입 불가' },
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function ResultPage() {
  const router = useRouter();
  const fullAnalysis = useAnalysisStore((s) => s.fullAnalysis);
  const data = fullAnalysis ?? mockAnalysis;

  const { pet, transport, flight } = data;
  const animalLabel = pet.animal_type === 'dog' ? '강아지' : '고양이';
  const badge = transportBadge[transport.mode] ?? transportBadge.CABIN;
  const cageSize = cageSizeByCategory[pet.size_category] ?? cageSizeByCategory.small;
  const fee = feeByAirline[flight.airline_code] ?? feeByAirline.KE;

  const details = [
    { label: '항공사 규정', value: '기내 반입 1마리 허용' },
    { label: '권장 케이지', value: cageSize },
    { label: '추가 비용', value: fee },
    { label: '좌석 제한', value: '임의석 확인 보관(창가석 추천)' },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <StepNavigation
          title="분석 결과"
          currentStep={4}
          totalSteps={9}
          onBack={() => router.push('/step/photo')}
        />

        <main className="flex-1 px-5 pt-6 pb-[120px]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
          >
            {/* Main heading */}
            <motion.div variants={itemVariants}>
              <h2 className="text-[26px] font-bold text-[#191F28] leading-[1.4] break-keep">
                {animalLabel}{'\n'}
                <span className="text-[#3182F6]">{pet.breed_ko}</span>
                {'\n'}가 맞으신가요?
              </h2>
            </motion.div>

            {/* Transport badge */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <Badge variant={badge.variant}>
                {badge.label}
              </Badge>
            </motion.div>

            {/* Details card */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex flex-col">
                  {details.map((detail, i) => (
                    <div
                      key={detail.label}
                      className={`flex items-center justify-between py-3.5 ${
                        i < details.length - 1 ? 'border-b border-[#F2F4F6]' : ''
                      }`}
                    >
                      <span className="text-[15px] text-[#8B95A1] break-keep">
                        {detail.label}
                      </span>
                      <span className="text-[15px] font-semibold text-[#191F28] break-keep text-right">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </main>

        <BottomCTA onClick={() => router.push('/result/documents')}>
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

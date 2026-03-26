'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { Card, Badge } from '@/components/ui';
import { useAnalysisStore } from '@/stores/analysis-store';

const cageSizeByCategory: Record<string, string> = {
  small: '45 x 35 x 28cm',
  medium: '67 x 51 x 47cm',
  large: '91 x 61 x 66cm',
};

const feeByAirline: Record<string, string> = {
  KE: '50,000원',
  OZ: '50,000원',
  '7C': '30,000원',
  LJ: '30,000원',
  TW: '30,000원',
  BX: '30,000원',
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
  const petAnalysis = useAnalysisStore((s) => s.petAnalysis);
  const flightInfo = useAnalysisStore((s) => s.flightInfo);

  // No data at all - user navigated directly
  if (!petAnalysis && !fullAnalysis) {
    return (
      <PageTransition>
        <div className="flex flex-col min-h-screen bg-white">
          <StepNavigation
            title="분석 결과"
            currentStep={4}
            totalSteps={9}
            onBack={() => router.push('/step/photo')}
          />
          <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
            <p className="text-[18px] font-semibold text-[#191F28]">
              분석 데이터가 없어요
            </p>
            <p className="text-[15px] text-[#8B95A1] text-center break-keep">
              반려동물 사진을 먼저 등록해주세요
            </p>
            <button
              type="button"
              onClick={() => router.push('/step/photo')}
              className="mt-4 px-6 py-3 rounded-[12px] bg-[#3182F6] text-white text-[15px] font-semibold"
            >
              사진 등록하러 가기
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Build display data from fullAnalysis (preferred) or petAnalysis + flightInfo
  const pet = fullAnalysis
    ? fullAnalysis.pet
    : petAnalysis
      ? {
          animal_type: petAnalysis.animal_type,
          breed_ko: petAnalysis.breed_ko,
          breed_en: petAnalysis.breed_en,
          estimated_weight_kg: petAnalysis.estimated_weight_kg,
          is_brachycephalic: petAnalysis.is_brachycephalic,
          size_category: petAnalysis.size_category,
        }
      : null;

  const flight = fullAnalysis
    ? fullAnalysis.flight
    : flightInfo
      ? {
          airline_code: flightInfo.airline_code,
          airline_name_ko: flightInfo.airline_name_ko,
          flight_number: flightInfo.flight_number,
          departure_date: flightInfo.departure_date,
          departure_airport: flightInfo.departure_airport,
          arrival_airport: flightInfo.arrival_airport,
          destination_country_code: flightInfo.destination_country_code,
          destination_country_ko: flightInfo.destination_country_ko,
        }
      : null;

  const transport = fullAnalysis?.transport ?? null;

  const animalLabel = pet?.animal_type === 'dog' ? '강아지' : '고양이';
  const badge = transport
    ? transportBadge[transport.mode] ?? transportBadge.CABIN
    : null;
  const cageSize = pet
    ? cageSizeByCategory[pet.size_category] ?? cageSizeByCategory.small
    : cageSizeByCategory.small;
  const fee = flight
    ? feeByAirline[flight.airline_code] ?? '확인 필요'
    : '확인 필요';

  const details = [
    ...(transport
      ? [{ label: '운송 방식', value: transport.reason }]
      : []),
    ...(flight
      ? [{ label: '항공사', value: `${flight.airline_name_ko} (${flight.flight_number})` }]
      : []),
    ...(pet
      ? [
          { label: '추정 체중', value: `${pet.estimated_weight_kg}kg` },
          { label: '크기 분류', value: pet.size_category === 'small' ? '소형' : pet.size_category === 'medium' ? '중형' : '대형' },
        ]
      : []),
    { label: '권장 케이지', value: cageSize },
    { label: '추가 비용', value: fee },
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
                <span className="text-[#3182F6]">{pet?.breed_ko ?? '알 수 없음'}</span>
                {'\n'}가 맞으신가요?
              </h2>
              {pet && (
                <p className="text-[15px] text-[#8B95A1] mt-2">
                  {pet.breed_en} / 추정 {pet.estimated_weight_kg}kg
                </p>
              )}
            </motion.div>

            {/* Transport badge */}
            {badge && (
              <motion.div variants={itemVariants} className="flex justify-center">
                <Badge variant={badge.variant}>
                  {badge.label}
                </Badge>
              </motion.div>
            )}

            {/* Warnings */}
            {fullAnalysis?.warnings && fullAnalysis.warnings.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="p-4 rounded-[12px] bg-[#FFF8E1] border border-[#FFE082]">
                  {fullAnalysis.warnings.map((warning, i) => (
                    <p key={i} className="text-[14px] text-[#6D4C00] leading-[1.6]">
                      {warning}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

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
                      <span className="text-[15px] font-semibold text-[#191F28] break-keep text-right max-w-[60%]">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Total cost if available */}
            {fullAnalysis?.totalEstimatedCost && (
              <motion.div variants={itemVariants}>
                <Card>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[15px] text-[#8B95A1]">예상 총 비용</span>
                    <span className="text-[17px] font-bold text-[#3182F6]">
                      {fullAnalysis.totalEstimatedCost}
                    </span>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </main>

        <BottomCTA onClick={() => router.push('/result/documents')}>
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

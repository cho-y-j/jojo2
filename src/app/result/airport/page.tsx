'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { Card, Badge } from '@/components/ui';
import { useAnalysisStore } from '@/stores/analysis-store';

interface Facility {
  id: string;
  name: string;
  terminal: 'T1' | 'T2';
  location: string;
  floor: string;
  operatingHours: string;
  description: string;
}

const facilities: Facility[] = [
  {
    id: 'quarantine-t1',
    name: '농림축산검역본부 (검역 사무소)',
    terminal: 'T1',
    location: '입국장 1층',
    floor: '1F',
    operatingHours: '06:00 ~ 22:00',
    description: '수출검역증명서 발급 및 검역 절차를 진행해요. 출발 당일 방문이 필요해요.',
  },
  {
    id: 'animal-care-t1',
    name: '반려동물 케어룸',
    terminal: 'T1',
    location: '교통센터 지하 1층',
    floor: 'B1F',
    operatingHours: '24시간',
    description: '출발 전 반려동물이 쉴 수 있는 공간이에요. 급수대와 간단한 용품이 비치되어 있어요.',
  },
  {
    id: 'pet-toilet-t1',
    name: '반려동물 전용 화장실',
    terminal: 'T1',
    location: '3층 출발장 동편',
    floor: '3F',
    operatingHours: '24시간',
    description: '반려동물 전용 배변 패드와 세척 시설이 갖춰져 있어요.',
  },
  {
    id: 'pet-hotel-t1',
    name: '펫 호텔',
    terminal: 'T1',
    location: '교통센터 지하 1층',
    floor: 'B1F',
    operatingHours: '09:00 ~ 18:00',
    description: '장기 보관이 필요할 때 이용할 수 있는 반려동물 호텔이에요. 사전 예약을 추천해요.',
  },
  {
    id: 'quarantine-t2',
    name: '농림축산검역본부 (검역 사무소)',
    terminal: 'T2',
    location: '입국장 1층',
    floor: '1F',
    operatingHours: '06:00 ~ 22:00',
    description: '제2터미널 출발 시 이곳에서 검역 절차를 진행해요.',
  },
  {
    id: 'animal-care-t2',
    name: '반려동물 케어룸',
    terminal: 'T2',
    location: '교통센터 지하 1층',
    floor: 'B1F',
    operatingHours: '24시간',
    description: '제2터미널 이용 시 반려동물 휴식 공간으로 활용할 수 있어요.',
  },
  {
    id: 'pet-toilet-t2',
    name: '반려동물 전용 화장실',
    terminal: 'T2',
    location: '3층 출발장 중앙',
    floor: '3F',
    operatingHours: '24시간',
    description: '배변 패드와 물 급수대가 마련되어 있어요.',
  },
];

const terminalGroups = [
  { terminal: 'T1' as const, label: '제1터미널' },
  { terminal: 'T2' as const, label: '제2터미널' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function AirportPage() {
  const router = useRouter();
  const reset = useAnalysisStore((s) => s.reset);

  const handleGoHome = () => {
    reset();
    router.push('/');
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <StepNavigation
          title="공항 시설 안내"
          currentStep={9}
          totalSteps={9}
          onBack={() => router.push('/result/seat')}
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
              인천공항 내{'\n'}반려동물 서비스를{'\n'}확인해보세요!
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-[15px] text-[#4E5968] leading-[1.6] mb-6 break-keep"
            >
              이용할 터미널에 맞는 시설을 확인하세요
            </motion.p>

            {/* Grouped by terminal */}
            {terminalGroups.map((group) => {
              const groupFacilities = facilities.filter((f) => f.terminal === group.terminal);
              return (
                <motion.div key={group.terminal} variants={itemVariants} className="mb-6">
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[15px] font-bold text-[#191F28]">
                      {group.label}
                    </span>
                    <span className="text-[13px] text-[#8B95A1]">
                      {groupFacilities.length}개 시설
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {groupFacilities.map((facility) => (
                      <motion.div key={facility.id} variants={itemVariants}>
                        <Card>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-[17px] font-semibold text-[#191F28] break-keep flex-1 mr-2">
                              {facility.name}
                            </h3>
                            <Badge
                              variant="success"
                              icon={null}
                              className="text-[11px] px-2 py-0.5 flex-shrink-0 bg-[#F2F4F6] text-[#4E5968]"
                            >
                              {facility.floor}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#8B95A1]" />
                            <span className="text-[13px] text-[#8B95A1]">
                              {facility.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-3">
                            <Clock className="w-3.5 h-3.5 text-[#8B95A1]" />
                            <span className="text-[13px] text-[#8B95A1]">
                              {facility.operatingHours}
                            </span>
                          </div>

                          <p className="text-[15px] text-[#4E5968] leading-[1.6] break-keep">
                            {facility.description}
                          </p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </main>

        <BottomCTA onClick={handleGoHome}>
          처음으로 돌아가기
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

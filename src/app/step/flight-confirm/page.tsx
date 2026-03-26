'use client';

import { useRouter } from 'next/navigation';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function FlightConfirmPage() {
  const router = useRouter();
  const flightInfo = useAnalysisStore((s) => s.flightInfo);

  // If no flight info, redirect back
  if (!flightInfo) {
    return (
      <PageTransition>
        <div className="flex flex-col min-h-screen bg-white">
          <StepNavigation
            title="항공편 확인"
            currentStep={2}
            totalSteps={9}
            onBack={() => router.push('/step/flight')}
          />
          <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
            <p className="text-[18px] font-semibold text-[#191F28]">
              항공편 정보가 없어요
            </p>
            <p className="text-[15px] text-[#8B95A1] text-center break-keep">
              항공편 정보를 먼저 입력해주세요
            </p>
            <button
              type="button"
              onClick={() => router.push('/step/flight')}
              className="mt-4 px-6 py-3 rounded-[12px] bg-[#3182F6] text-white text-[15px] font-semibold"
            >
              항공편 입력하러 가기
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const destinationName = flightInfo.destination_country_ko;
  const airlineName = flightInfo.airline_name_ko;
  const flightNumberText = flightInfo.flight_number;

  const dateText = (() => {
    const date = new Date(flightInfo.departure_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  })();

  const routeText = `${flightInfo.departure_airport} → ${flightInfo.arrival_airport}`;

  // Pick the right postposition for destination
  const destPostfix = (() => {
    if (!destinationName) return '으로';
    const lastChar = destinationName[destinationName.length - 1];
    if (lastChar === '국' || lastChar === '만' || lastChar === '남') return '으로';
    return '로';
  })();

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <StepNavigation
          title="항공편 확인"
          currentStep={2}
          totalSteps={9}
          onBack={() => router.push('/step/flight')}
        />

        <div className="flex-1 px-5 pt-10 pb-[120px]">
          {/* Heading */}
          <h2 className="text-[22px] font-bold text-[#191F28] leading-[1.4] break-keep mb-10">
            확인되었어요!
          </h2>

          {/* Confirmation text */}
          <div className="text-[22px] leading-[1.6] text-[#191F28] break-keep">
            <p>
              <span className="font-bold">{destinationName}</span>
              {destPostfix}
            </p>
            <p>
              <span className="font-bold">{dateText}</span>
              에
            </p>
            <p>
              <span className="font-bold">{airlineName}</span>
              으로
            </p>
            <p>떠나시네요!</p>
          </div>

          {/* Flight details */}
          <div className="mt-8 p-4 rounded-[16px] bg-[#F8F9FA]">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-[14px] text-[#8B95A1]">편명</span>
                <span className="text-[14px] font-semibold text-[#191F28]">{flightNumberText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#8B95A1]">구간</span>
                <span className="text-[14px] font-semibold text-[#191F28]">{routeText}</span>
              </div>
            </div>
          </div>
        </div>

        <BottomCTA onClick={() => router.push('/step/photo')}>
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function FlightConfirmPage() {
  const router = useRouter();
  const flightInfo = useAnalysisStore((s) => s.flightInfo);

  const destinationName = flightInfo?.destination_country_ko ?? 'OO';
  const airlineName = flightInfo?.airline_name_ko ?? 'OO항공사';

  const dateText = (() => {
    if (!flightInfo?.departure_date) return 'OO년 OO월 OO일';
    const date = new Date(flightInfo.departure_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  })();

  // Pick the right postposition for destination
  const destPostfix = (() => {
    if (!destinationName) return '으로';
    const lastChar = destinationName[destinationName.length - 1];
    // Korean particle rule: after consonant-ending use 으로, after vowel-ending use 로
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
        </div>

        <BottomCTA onClick={() => router.push('/step/photo')}>
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

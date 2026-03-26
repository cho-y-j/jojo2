'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2 } from 'lucide-react';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { useAnalysisStore } from '@/stores/analysis-store';

type Tab = 'capture' | 'manual';

const AIRLINES = [
  { code: 'KE', name: '대한항공' },
  { code: 'OZ', name: '아시아나' },
  { code: '7C', name: '제주항공' },
  { code: 'LJ', name: '진에어' },
  { code: 'TW', name: '티웨이' },
  { code: 'BX', name: '에어부산' },
] as const;

const DESTINATIONS = [
  { code: 'JP', name: '일본', airport: 'NRT' },
  { code: 'US', name: '미국', airport: 'LAX' },
  { code: 'TH', name: '태국', airport: 'BKK' },
  { code: 'VN', name: '베트남', airport: 'SGN' },
  { code: 'TW', name: '대만', airport: 'TPE' },
] as const;

export default function FlightPage() {
  const router = useRouter();
  const setFlightInfo = useAnalysisStore((s) => s.setFlightInfo);
  const setFlightPhoto = useAnalysisStore((s) => s.setFlightPhoto);

  const [tab, setTab] = useState<Tab>('capture');

  // Manual input state
  const [airlineCode, setAirlineCode] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [destinationCode, setDestinationCode] = useState('');

  // Capture upload state
  const [capturePreview, setCapturePreview] = useState<string | null>(null);
  const [captureAnalyzing, setCaptureAnalyzing] = useState(false);
  const [captureParsed, setCaptureParsed] = useState(false);
  const captureInputRef = useRef<HTMLInputElement>(null);

  const selectedAirline = AIRLINES.find((a) => a.code === airlineCode);
  const selectedDest = DESTINATIONS.find((d) => d.code === destinationCode);

  const isManualComplete =
    airlineCode !== '' &&
    flightNumber.trim() !== '' &&
    departureDate !== '' &&
    destinationCode !== '';

  const isReady =
    (tab === 'manual' && isManualComplete) ||
    (tab === 'capture' && captureParsed);

  const handleNext = useCallback(() => {
    if (tab === 'manual' && isManualComplete && selectedAirline && selectedDest) {
      setFlightInfo({
        airline_code: selectedAirline.code,
        airline_name_ko: selectedAirline.name,
        flight_number: `${selectedAirline.code}${flightNumber}`,
        departure_date: departureDate,
        departure_airport: 'ICN',
        arrival_airport: selectedDest.airport,
        destination_country_code: selectedDest.code,
        destination_country_ko: selectedDest.name,
        confidence: 1.0,
      });
    }
    router.push('/step/flight-confirm');
  }, [
    tab,
    isManualComplete,
    selectedAirline,
    selectedDest,
    flightNumber,
    departureDate,
    setFlightInfo,
    router,
  ]);

  const handleCaptureUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFlightPhoto(file);
      setCapturePreview(URL.createObjectURL(file));
      setCaptureAnalyzing(true);
      setCaptureParsed(false);

      // Simulate parsing
      setTimeout(() => {
        setCaptureAnalyzing(false);
        setCaptureParsed(true);
        // Set mock parsed data
        setFlightInfo({
          airline_code: 'KE',
          airline_name_ko: '대한항공',
          flight_number: 'KE701',
          departure_date: '2026-05-15',
          departure_airport: 'ICN',
          arrival_airport: 'NRT',
          destination_country_code: 'JP',
          destination_country_ko: '일본',
          confidence: 0.92,
        });
      }, 2500);
    },
    [setFlightPhoto, setFlightInfo],
  );

  const inputClass =
    'w-full h-[52px] rounded-[12px] border border-[#E5E8EB] px-4 text-[16px] text-[#191F28] bg-white outline-none focus:border-[#3182F6] transition-colors appearance-none';
  const labelClass = 'text-[14px] font-medium text-[#4E5968] mb-2 block';

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <StepNavigation
          title="항공편 정보"
          currentStep={1}
          totalSteps={9}
          onBack={() => router.push('/')}
        />

        <div className="flex-1 px-5 pt-6 pb-[120px]">
          {/* Heading */}
          <h2 className="text-[22px] font-bold text-[#191F28] leading-[1.4] break-keep mb-2">
            어디로 향하시나요?
          </h2>
          <p className="text-[15px] text-[#4E5968] leading-[1.6] mb-8">
            항공편 정보를 입력해주세요
          </p>

          {/* Tab UI */}
          <div className="flex border-b border-[#E5E8EB] mb-6">
            <button
              type="button"
              onClick={() => setTab('capture')}
              className={`flex-1 h-[48px] text-[15px] font-semibold transition-colors ${
                tab === 'capture'
                  ? 'text-[#191F28] border-b-2 border-[#3182F6]'
                  : 'text-[#8B95A1]'
              }`}
            >
              카메라로 찍어서 올리기(캡쳐본)
            </button>
            <button
              type="button"
              onClick={() => setTab('manual')}
              className={`flex-1 h-[48px] text-[15px] font-semibold transition-colors ${
                tab === 'manual'
                  ? 'text-[#191F28] border-b-2 border-[#3182F6]'
                  : 'text-[#8B95A1]'
              }`}
            >
              수기 입력
            </button>
          </div>

          {tab === 'capture' ? (
            /* Capture upload tab */
            <div className="flex flex-col items-center">
              {!capturePreview ? (
                <label className="flex flex-col items-center justify-center gap-3 w-full h-[240px] rounded-[16px] border-2 border-dashed border-[#D1D6DB] cursor-pointer hover:border-[#3182F6] hover:bg-[#F8FBFF] transition-colors">
                  <Upload className="w-8 h-8 text-[#8B95A1]" />
                  <span className="text-[15px] text-[#4E5968] font-medium text-center break-keep">
                    항공편 예약 캡쳐를
                    <br />
                    업로드해주세요
                  </span>
                  <input
                    ref={captureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCaptureUpload}
                  />
                </label>
              ) : (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full rounded-[16px] overflow-hidden bg-[#F2F4F6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={capturePreview}
                      alt="항공편 캡쳐 미리보기"
                      className="w-full object-contain max-h-[300px]"
                    />
                  </div>

                  {captureAnalyzing ? (
                    <div className="flex items-center gap-2 p-4 rounded-[16px] bg-[#F2F4F6] w-full justify-center">
                      <Loader2 className="w-5 h-5 text-[#3182F6] animate-spin" />
                      <span className="text-[15px] text-[#4E5968]">
                        분석 중...
                      </span>
                    </div>
                  ) : captureParsed ? (
                    <div className="w-full p-4 rounded-[16px] bg-[#F8FBFF] border border-[#E8F0FE]">
                      <p className="text-[15px] text-[#3182F6] font-medium leading-[1.5] text-center break-keep">
                        대한항공으로 5월 15일에 일본으로 떠나시네요!
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            /* Manual input tab */
            <div className="flex flex-col gap-5">
              {/* Airline select */}
              <div>
                <label className={labelClass}>항공사</label>
                <select
                  value={airlineCode}
                  onChange={(e) => setAirlineCode(e.target.value)}
                  className={inputClass}
                >
                  <option value="">항공사를 선택해주세요</option>
                  {AIRLINES.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.name} ({a.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Flight number */}
              <div>
                <label className={labelClass}>편명</label>
                <input
                  type="text"
                  placeholder="예: 701"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Departure date */}
              <div>
                <label className={labelClass}>출발일</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Destination */}
              <div>
                <label className={labelClass}>도착지</label>
                <select
                  value={destinationCode}
                  onChange={(e) => setDestinationCode(e.target.value)}
                  className={inputClass}
                >
                  <option value="">도착지를 선택해주세요</option>
                  {DESTINATIONS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <BottomCTA disabled={!isReady} onClick={handleNext}>
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

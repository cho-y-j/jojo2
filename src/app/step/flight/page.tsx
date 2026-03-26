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
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [parsedSummary, setParsedSummary] = useState<string | null>(null);
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
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFlightPhoto(file);
      setCapturePreview(URL.createObjectURL(file));
      setCaptureAnalyzing(true);
      setCaptureParsed(false);
      setCaptureError(null);
      setParsedSummary(null);

      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/analyze/flight', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error ?? '항공편 분석에 실패했어요');
        }

        const data = json.data;
        setFlightInfo(data);
        setCaptureParsed(true);

        // Build a human-readable summary from the actual parsed data
        const dateObj = new Date(data.departure_date);
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        setParsedSummary(
          `${data.airline_name_ko}으로 ${month}월 ${day}일에 ${data.destination_country_ko}로 떠나시네요!`,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : '분석 중 오류가 발생했어요';
        setCaptureError(message);
        setCaptureParsed(false);
      } finally {
        setCaptureAnalyzing(false);
      }
    },
    [setFlightPhoto, setFlightInfo],
  );

  const handleCaptureReset = useCallback(() => {
    setCapturePreview(null);
    setCaptureAnalyzing(false);
    setCaptureParsed(false);
    setCaptureError(null);
    setParsedSummary(null);
    if (captureInputRef.current) captureInputRef.current.value = '';
  }, []);

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
                  ) : captureError ? (
                    <div className="w-full flex flex-col gap-3">
                      <div className="p-4 rounded-[12px] bg-[#FFF0F0] border border-[#FFD4D4]">
                        <p className="text-[14px] text-[#E5503C] leading-[1.5]">
                          {captureError}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCaptureReset}
                        className="text-[14px] text-[#3182F6] font-medium"
                      >
                        다시 시도하기
                      </button>
                    </div>
                  ) : captureParsed && parsedSummary ? (
                    <div className="w-full flex flex-col gap-3">
                      <div className="w-full p-4 rounded-[16px] bg-[#F8FBFF] border border-[#E8F0FE]">
                        <p className="text-[15px] text-[#3182F6] font-medium leading-[1.5] text-center break-keep">
                          {parsedSummary}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCaptureReset}
                        className="text-[14px] text-[#8B95A1] font-medium text-center"
                      >
                        다시 업로드하기
                      </button>
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

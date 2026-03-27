'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ImageIcon, Loader2 } from 'lucide-react';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function PhotoPage() {
  const router = useRouter();
  const setPetPhoto = useAnalysisStore((s) => s.setPetPhoto);
  const petPhoto = useAnalysisStore((s) => s.petPhoto);
  const setPetAnalysis = useAnalysisStore((s) => s.setPetAnalysis);
  const setFullAnalysis = useAnalysisStore((s) => s.setFullAnalysis);
  const flightInfo = useAnalysisStore((s) => s.flightInfo);

  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPetPhoto(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
      setErrorMsg(null);
    },
    [setPetPhoto],
  );

  const handleReset = useCallback(() => {
    setPreview(null);
    setPetPhoto(null);
    setErrorMsg(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (albumInputRef.current) albumInputRef.current.value = '';
  }, [setPetPhoto]);

  const handleNext = useCallback(async () => {
    if (!petPhoto) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Step 1: Analyze the pet photo
      const formData = new FormData();
      formData.append('image', petPhoto);

      const photoRes = await fetch('/api/analyze/photo', {
        method: 'POST',
        body: formData,
      });

      const photoJson = await photoRes.json();

      if (!photoRes.ok || !photoJson.success) {
        throw new Error(photoJson.error ?? '사진 분석에 실패했어요');
      }

      const photoResult = photoJson.data;
      setPetAnalysis(photoResult);

      // Step 2: If flight info also exists, run full analysis
      if (flightInfo) {
        try {
          const fullRes = await fetch('/api/analyze/full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              petInfo: {
                animal_type: photoResult.animal_type,
                breed_ko: photoResult.breed_ko,
                breed_en: photoResult.breed_en,
                estimated_weight_kg: photoResult.estimated_weight_kg,
                is_brachycephalic: photoResult.is_brachycephalic,
                size_category: photoResult.size_category,
              },
              flightInfo: {
                airline_code: flightInfo.airline_code,
                airline_name_ko: flightInfo.airline_name_ko,
                flight_number: flightInfo.flight_number,
                departure_date: flightInfo.departure_date,
                departure_airport: flightInfo.departure_airport,
                arrival_airport: flightInfo.arrival_airport,
                destination_country_code: flightInfo.destination_country_code,
                destination_country_ko: flightInfo.destination_country_ko,
              },
            }),
          });

          const fullJson = await fullRes.json();

          if (fullRes.ok && fullJson.success) {
            setFullAnalysis(fullJson.data);
          }
        } catch {
          // Full analysis failure is non-fatal; we still have pet + flight data
        }
      }

      router.push('/result');
    } catch (err) {
      const message = err instanceof Error ? err.message : '분석 중 오류가 발생했어요';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, [petPhoto, flightInfo, setPetAnalysis, setFullAnalysis, router]);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <StepNavigation
          title="반려동물 사진"
          currentStep={3}
          totalSteps={9}
          onBack={() => router.push('/step/flight-confirm')}
        />

        <div className="flex-1 px-5 pt-6 pb-[120px]">
          {/* Heading */}
          <h2 className="text-[22px] font-bold text-[#191F28] leading-[1.4] break-keep mb-2">
            반려동물 사진을 넣어주세요
          </h2>
          <p className="text-[15px] text-[#4E5968] leading-[1.6] mb-4">
            AI가 품종과 체중을 자동으로 분석해요
          </p>

          {/* 측정 사물 안내 */}
          <div className="rounded-[12px] bg-[#F8FBFF] border border-[#E8F0FE] p-4 mb-6">
            <p className="text-[14px] font-semibold text-[#3182F6] mb-1.5 break-keep">
              더 정확한 체중 측정을 원하시나요?
            </p>
            <p className="text-[13px] text-[#4E5968] leading-[1.6] break-keep mb-2">
              아래 물건과 함께 찍으면 크기를 더 정확하게 측정할 수 있어요.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['500ml 페트병', 'A4 용지', '신용카드', '15cm 자', '스마트폰'].map((item) => (
                <span
                  key={item}
                  className="px-2 py-1 rounded-full bg-white border border-[#E5E8EB] text-[12px] text-[#333D4B]"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="text-[12px] text-[#8B95A1] mt-2 break-keep">
              사물 없이 반려동물만 올리면 품종별 평균으로 계산해요
            </p>
          </div>

          {/* Loading overlay */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="w-10 h-10 text-[#3182F6] animate-spin" />
              <p className="text-[17px] font-semibold text-[#191F28] animate-pulse">
                AI가 분석 중이에요...
              </p>
              <p className="text-[14px] text-[#8B95A1]">
                잠시만 기다려주세요
              </p>
            </div>
          ) : preview ? (
            /* Photo preview */
            <div className="flex flex-col items-center gap-4">
              <div className="w-full aspect-square rounded-[16px] overflow-hidden bg-[#F2F4F6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="반려동물 사진 미리보기"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[14px] text-[#3182F6] font-medium"
              >
                다시 선택하기
              </button>
            </div>
          ) : (
            /* Upload cards */
            <div className="flex flex-col gap-3">
              {/* Camera card */}
              <label className="flex flex-col items-center justify-center gap-3 h-[160px] rounded-[16px] border-2 border-dashed border-[#D1D6DB] cursor-pointer hover:border-[#3182F6] hover:bg-[#F8FBFF] transition-colors">
                <Camera className="w-8 h-8 text-[#8B95A1]" />
                <span className="text-[15px] text-[#4E5968] font-medium">
                  카메라로 찍어서 올리기
                </span>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Album card */}
              <label className="flex flex-col items-center justify-center gap-3 h-[160px] rounded-[16px] border-2 border-dashed border-[#D1D6DB] cursor-pointer hover:border-[#3182F6] hover:bg-[#F8FBFF] transition-colors">
                <ImageIcon className="w-8 h-8 text-[#8B95A1]" />
                <span className="text-[15px] text-[#4E5968] font-medium">
                  갤러리
                </span>
                <input
                  ref={albumInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-[12px] bg-[#FFF0F0] border border-[#FFD4D4]">
              <p className="text-[14px] text-[#E5503C] leading-[1.5]">
                {errorMsg}
              </p>
            </div>
          )}
        </div>

        <BottomCTA
          disabled={!preview || isLoading}
          onClick={handleNext}
        >
          {isLoading ? '분석 중...' : '다음'}
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

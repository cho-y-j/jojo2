'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ImageIcon } from 'lucide-react';
import { StepNavigation, BottomCTA, PageTransition } from '@/components/layout';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function PhotoPage() {
  const router = useRouter();
  const setPetPhoto = useAnalysisStore((s) => s.setPetPhoto);
  const [preview, setPreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPetPhoto(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    },
    [setPetPhoto],
  );

  const handleReset = useCallback(() => {
    setPreview(null);
    setPetPhoto(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (albumInputRef.current) albumInputRef.current.value = '';
  }, [setPetPhoto]);

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
          <p className="text-[15px] text-[#4E5968] leading-[1.6] mb-8">
            AI가 품종과 체중을 자동으로 분석해요
          </p>

          {preview ? (
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
        </div>

        <BottomCTA
          disabled={!preview}
          onClick={() => router.push('/result')}
        >
          다음
        </BottomCTA>
      </div>
    </PageTransition>
  );
}

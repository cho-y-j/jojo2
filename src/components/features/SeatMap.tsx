'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// 타입 정의
// ============================================================
type SeatStatus = 'recommended' | 'allowed' | 'blocked' | 'exit' | 'empty';

interface AircraftConfig {
  code: string;
  name: string;
  layout: string;
  columns: string[];
  rowStart: number;
  rowEnd: number;
  exitRows: number[];
  bulkheadRows: number[];
  blockedRows: number[];
  recommendedCols: string[];
  allowedCols: string[];
  blockedCols: string[];
  petScore: number;
  petLabel: string;
  tips: string;
}

// ============================================================
// 항공기 데이터 (6개 주요 기종)
// ============================================================
const AIRCRAFT_DATA: AircraftConfig[] = [
  {
    code: 'A380-800',
    name: 'Airbus A380',
    layout: '3-4-3',
    columns: ['A','B','C','_','D','E','F','G','_','H','J','K'],
    rowStart: 60, rowEnd: 95,
    exitRows: [72, 73], bulkheadRows: [60, 74],
    blockedRows: [60, 72, 73, 74],
    recommendedCols: ['A', 'K'],
    allowedCols: ['A','B','C','H','J','K'],
    blockedCols: [],
    petScore: 5, petLabel: '최고',
    tips: '반려동물에 최적! 좌석 피치 최대 34인치, 아래 공간 가장 넓어요'
  },
  {
    code: 'B787-9',
    name: 'Boeing 787-9',
    layout: '3-3-3',
    columns: ['A','B','C','_','D','E','F','_','G','H','J'],
    rowStart: 25, rowEnd: 58,
    exitRows: [38, 39], bulkheadRows: [25, 40],
    blockedRows: [25, 38, 39, 40],
    recommendedCols: ['A', 'J'],
    allowedCols: ['A','B','C','G','H','J'],
    blockedCols: [],
    petScore: 4, petLabel: '좋음',
    tips: '습도 조절 우수하여 반려동물이 편안해요'
  },
  {
    code: 'B777-300ER',
    name: 'Boeing 777-300ER',
    layout: '3-3-3',
    columns: ['A','B','C','_','D','E','F','_','G','H','J'],
    rowStart: 30, rowEnd: 71,
    exitRows: [40, 41, 55, 56], bulkheadRows: [30, 42, 57],
    blockedRows: [30, 40, 41, 42, 55, 56, 57],
    recommendedCols: ['A', 'J'],
    allowedCols: ['A','B','C','G','H','J'],
    blockedCols: [],
    petScore: 3, petLabel: '보통',
    tips: '가장 많이 운항되는 기종. 윈도우석을 선택하세요'
  },
  {
    code: 'A330-300',
    name: 'Airbus A330-300',
    layout: '2-4-2',
    columns: ['A','B','_','D','E','F','G','_','H','J'],
    rowStart: 25, rowEnd: 60,
    exitRows: [38, 39], bulkheadRows: [25, 40],
    blockedRows: [25, 38, 39, 40],
    recommendedCols: ['A', 'J'],
    allowedCols: ['A','B','H','J'],
    blockedCols: ['D','E','F','G'],
    petScore: 3, petLabel: '보통',
    tips: '2-4-2 배치! 윈도우 쪽 2인석이 가장 편안해요'
  },
  {
    code: 'B737-800',
    name: 'Boeing 737-800',
    layout: '3-3',
    columns: ['A','B','C','_','D','E','F'],
    rowStart: 1, rowEnd: 30,
    exitRows: [14, 15], bulkheadRows: [1, 16],
    blockedRows: [1, 14, 15, 16],
    recommendedCols: ['A', 'F'],
    allowedCols: ['A','B','E','F'],
    blockedCols: [],
    petScore: 2, petLabel: '좁음',
    tips: '좌석 피치 좁아요! 소형 캐리어만 가능해요'
  },
  {
    code: 'A321neo',
    name: 'Airbus A321neo',
    layout: '3-3',
    columns: ['A','B','C','_','D','E','F'],
    rowStart: 1, rowEnd: 33,
    exitRows: [14, 15], bulkheadRows: [1, 16],
    blockedRows: [1, 14, 15, 16],
    recommendedCols: ['A', 'F'],
    allowedCols: ['A','B','E','F'],
    blockedCols: [],
    petScore: 2, petLabel: '좁음',
    tips: 'B737보다 약간 넓은 편. LCC 중에선 나은 선택'
  }
];

// ============================================================
// 좌석 상태 판별
// ============================================================
function getSeatStatus(
  row: number,
  col: string,
  config: AircraftConfig
): SeatStatus {
  if (config.blockedRows.includes(row)) return 'blocked';
  if (config.blockedCols.includes(col)) return 'blocked';
  if (config.exitRows.includes(row)) return 'exit';
  if (config.recommendedCols.includes(col) && config.allowedCols.includes(col)) return 'recommended';
  if (config.allowedCols.includes(col)) return 'allowed';
  return 'blocked';
}

// ============================================================
// 색상 매핑
// ============================================================
const STATUS_COLORS: Record<SeatStatus, { bg: string; border: string; text: string }> = {
  recommended: { bg: '#E8F9EF', border: '#00C471', text: '#00C471' },
  allowed:     { bg: '#E8F0FE', border: '#3182F6', text: '#3182F6' },
  blocked:     { bg: '#F2F4F6', border: '#E5E8EB', text: '#8B95A1' },
  exit:        { bg: '#FFEAEC', border: '#F04452', text: '#F04452' },
  empty:       { bg: 'transparent', border: 'transparent', text: 'transparent' }
};

const STATUS_LABELS: Record<SeatStatus, string> = {
  recommended: '추천',
  allowed: '가능',
  blocked: '불가',
  exit: '비상구',
  empty: ''
};

// ============================================================
// 개별 좌석 컴포넌트 (compact: 22px)
// ============================================================
function Seat({
  col, status, isSelected, onSelect
}: {
  row: number;
  col: string;
  status: SeatStatus;
  isSelected: boolean;
  onSelect: () => void;
}) {
  if (col === '_') return <div style={{ width: '10px' }} />;

  const colors = STATUS_COLORS[status];
  const isClickable = status === 'recommended' || status === 'allowed';

  return (
    <motion.button
      whileTap={isClickable ? { scale: 0.9 } : undefined}
      onClick={isClickable ? onSelect : undefined}
      disabled={!isClickable}
      className="relative flex items-center justify-center rounded-[3px] font-semibold transition-all duration-100"
      style={{
        width: '22px',
        height: '22px',
        fontSize: '8px',
        backgroundColor: isSelected ? colors.border : colors.bg,
        border: `1px solid ${colors.border}`,
        color: isSelected ? '#FFFFFF' : colors.text,
        cursor: isClickable ? 'pointer' : 'default',
        opacity: status === 'blocked' ? 0.45 : 1,
      }}
    >
      {col}
      {status === 'recommended' && !isSelected && (
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00C471]" />
      )}
    </motion.button>
  );
}

// ============================================================
// 좌석 배치도 행 컴포넌트
// ============================================================
function SeatRow({
  row, columns, config, selectedSeat, onSelectSeat
}: {
  row: number;
  columns: string[];
  config: AircraftConfig;
  selectedSeat: string | null;
  onSelectSeat: (seatId: string) => void;
}) {
  const isExit = config.exitRows.includes(row);
  const isBulkhead = config.bulkheadRows.includes(row);

  return (
    <div className="flex items-center gap-[1px]">
      {/* 행 번호 */}
      <div className="w-5 text-right pr-1" style={{
        fontSize: '9px',
        fontWeight: 500,
        color: isExit ? '#F04452' : isBulkhead ? '#FF6B35' : '#8B95A1'
      }}>
        {row}
      </div>

      {/* 좌석들 */}
      <div className="flex gap-[1px]">
        {columns.map((col, idx) => {
          const status = col === '_' ? 'empty' as SeatStatus : getSeatStatus(row, col, config);
          const seatId = `${row}${col}`;
          return (
            <Seat
              key={idx}
              row={row}
              col={col}
              status={status}
              isSelected={selectedSeat === seatId}
              onSelect={() => onSelectSeat(seatId)}
            />
          );
        })}
      </div>

      {/* 비상구 표시 */}
      {isExit && (
        <span style={{ fontSize: '8px', color: '#F04452', fontWeight: 600, marginLeft: '2px' }}>EXIT</span>
      )}
    </div>
  );
}

// ============================================================
// 목적지 코드 -> 장거리/단거리 판별
// ============================================================
const LONG_HAUL_DESTINATIONS = ['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'NZ', 'ES', 'IT'];

function getRecommendedAircraftIndex(
  aircraft: AircraftConfig[],
  airlineCode: string,
  destinationCode?: string
): number {
  const isLongHaul = destinationCode ? LONG_HAUL_DESTINATIONS.includes(destinationCode) : false;

  if (['7C', 'LJ', 'TW', 'BX'].includes(airlineCode)) return 0;

  if (airlineCode === 'KE') {
    if (isLongHaul) {
      const a380Idx = aircraft.findIndex(a => a.code === 'A380-800');
      if (a380Idx >= 0) return a380Idx;
    }
    const b787Idx = aircraft.findIndex(a => a.code === 'B787-9');
    if (b787Idx >= 0) return b787Idx;
  }

  if (airlineCode === 'OZ') {
    if (isLongHaul) {
      const b777Idx = aircraft.findIndex(a => a.code === 'B777-300ER');
      if (b777Idx >= 0) return b777Idx;
    }
    const a330Idx = aircraft.findIndex(a => a.code === 'A330-300');
    if (a330Idx >= 0) return a330Idx;
  }

  return 0;
}

// ============================================================
// 메인: SeatMap 컴포넌트
// ============================================================
export default function SeatMap({
  airlineCode = 'KE',
  aircraftType,
  destinationCode,
  onSeatSelect
}: {
  airlineCode?: string;
  aircraftType?: string;
  destinationCode?: string;
  onSeatSelect?: (seatId: string, aircraft: string) => void;
}) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // 항공사에 맞는 기종 필터링
  const availableAircraft = useMemo(() => {
    return AIRCRAFT_DATA.filter(a => {
      const map: Record<string, string[]> = {
        'KE': ['A380-800','B777-300ER','B787-9'],
        'OZ': ['A330-300','B777-300ER','B787-9'],
        '7C': ['B737-800','A321neo'],
        'LJ': ['B737-800'],
        'TW': ['B737-800','A321neo'],
        'BX': ['B737-800','A321neo'],
      };
      return (map[airlineCode] || AIRCRAFT_DATA.map(x => x.code)).includes(a.code);
    });
  }, [airlineCode]);

  // aircraftType이 있으면 해당 기종을 기본 선택, 없으면 기존 로직
  const defaultIdx = useMemo(() => {
    if (aircraftType) {
      const idx = availableAircraft.findIndex(a => a.code === aircraftType);
      if (idx >= 0) return idx;
    }
    return getRecommendedAircraftIndex(availableAircraft, airlineCode, destinationCode);
  }, [availableAircraft, airlineCode, destinationCode, aircraftType]);

  const [selectedAircraft, setSelectedAircraft] = useState(defaultIdx);

  // aircraftType이 변경되면 탭도 변경
  useEffect(() => {
    setSelectedAircraft(defaultIdx);
  }, [defaultIdx]);

  const current = availableAircraft[selectedAircraft] || availableAircraft[0];
  if (!current) return null;

  // 10-12행만 표시
  const maxRows = 11;
  const displayStart = current.rowStart;
  const displayEnd = Math.min(current.rowStart + maxRows - 1, current.rowEnd);
  const rows = Array.from(
    { length: displayEnd - displayStart + 1 },
    (_, i) => displayStart + i
  );
  const hasMoreRows = displayEnd < current.rowEnd;

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(prev => prev === seatId ? null : seatId);
    onSeatSelect?.(seatId, current.code);
  };

  const petScoreColor = current.petScore >= 4 ? '#00C471' : current.petScore >= 3 ? '#3182F6' : '#FF6B35';
  const petScoreBg = current.petScore >= 4 ? '#E8F9EF' : current.petScore >= 3 ? '#E8F0FE' : '#FFF3E8';

  return (
    <div className="w-full max-w-[430px] mx-auto font-pretendard">
      {/* 요약 정보 카드 */}
      <div className="rounded-[12px] p-3 mb-3" style={{ backgroundColor: '#F8FAFB', border: '1px solid #E5E8EB' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '13px', color: '#4E5968' }}>
              {aircraftType ? '탑승 기종' : '추천 기종'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#191F28' }}>
              {current.name}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: petScoreBg, color: petScoreColor }}>
            <span style={{ fontSize: '11px' }}>🐾</span>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>{current.petLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span style={{ fontSize: '12px', color: '#00C471', fontWeight: 600 }}>
            윈도우석({current.recommendedCols.join(', ')})을 추천해요
          </span>
          <span style={{ fontSize: '11px', color: '#8B95A1' }}>|</span>
          <span style={{ fontSize: '12px', color: '#8B95A1' }}>
            배치 {current.layout}
          </span>
        </div>
      </div>

      {/* 기종 선택 탭 (horizontal scroll pills) */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 px-0.5 scrollbar-hide">
        {availableAircraft.map((aircraft, idx) => (
          <motion.button
            key={aircraft.code}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setSelectedAircraft(idx); setSelectedSeat(null); }}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-full transition-all"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: idx === selectedAircraft ? '#3182F6' : '#F2F4F6',
              color: idx === selectedAircraft ? '#FFFFFF' : '#4E5968',
            }}
          >
            {aircraft.code}
          </motion.button>
        ))}
      </div>

      {/* 좌석 배치도 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.code}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' as const }}
        >
          {/* 좌석 맵 영역 */}
          <div className="rounded-[12px] p-2.5 mt-2 overflow-x-auto" style={{ backgroundColor: '#FAFBFC' }}>
            {/* 기수 방향 */}
            <div className="flex justify-center mb-2">
              <div className="px-2.5 py-0.5 rounded-full" style={{
                backgroundColor: '#E8F0FE', color: '#3182F6', fontSize: '10px', fontWeight: 500
              }}>
                기수 방향 (앞)
              </div>
            </div>

            {/* 좌석 행들 */}
            <div className="flex flex-col gap-[1px] items-center">
              {rows.map(row => (
                <SeatRow
                  key={row}
                  row={row}
                  columns={current.columns}
                  config={current}
                  selectedSeat={selectedSeat}
                  onSelectSeat={handleSeatSelect}
                />
              ))}
            </div>

            {/* 하단 안내 */}
            {hasMoreRows && (
              <div className="text-center mt-2">
                <span style={{ fontSize: '10px', color: '#8B95A1' }}>
                  실제 좌석은 {current.rowEnd}열까지 더 많아요
                </span>
              </div>
            )}
          </div>

          {/* 범례 (inline, one line) */}
          <div className="flex items-center gap-3 mt-2 px-1">
            {(['recommended', 'allowed', 'blocked', 'exit'] as SeatStatus[]).map(status => (
              <div key={status} className="flex items-center gap-1">
                <div className="rounded-[2px]" style={{
                  width: '8px', height: '8px',
                  backgroundColor: STATUS_COLORS[status].bg,
                  border: `1px solid ${STATUS_COLORS[status].border}`,
                }} />
                <span style={{ fontSize: '10px', color: '#4E5968' }}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            ))}
          </div>

          {/* 선택된 좌석 정보 (compact) */}
          <AnimatePresence>
            {selectedSeat && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' as const }}
                className="mt-2 rounded-[10px] px-3 py-2.5 flex items-center gap-2.5"
                style={{ backgroundColor: '#E8F9EF', border: '1px solid #B5E8CC' }}
              >
                <div className="rounded-[8px] flex items-center justify-center font-bold"
                  style={{
                    width: '36px', height: '36px', fontSize: '14px',
                    backgroundColor: '#FFFFFF', color: '#00C471'
                  }}>
                  {selectedSeat}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#191F28' }}>
                    {selectedSeat}석 선택
                  </p>
                  <p style={{ fontSize: '12px', color: '#4E5968' }}>
                    {current.recommendedCols.includes(selectedSeat.slice(-1))
                      ? '반려동물 추천 윈도우석이에요!'
                      : '탑승 가능한 좌석이에요'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 기종 팁 (compact one-liner) */}
          <div className="mt-2 px-1">
            <p style={{ fontSize: '12px', color: '#8B95A1', lineHeight: 1.5 }}>
              {current.tips}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

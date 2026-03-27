'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// 타입 정의
// ============================================================
type SeatStatus = 'recommended' | 'allowed' | 'blocked' | 'exit' | 'empty';

interface SeatInfo {
  id: string;       // "32A"
  row: number;
  col: string;
  status: SeatStatus;
  reason?: string;
}

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
    tips: '⭐ 반려동물에 최적! 좌석 피치 최대 34인치, 아래 공간 가장 넓어요'
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
    tips: '습도 조절 우수 → 반려동물이 편안해요. 대형 창문으로 개방감'
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
    tips: '가장 많이 운항되는 기종. 윈도우 쪽 선택하세요'
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
    tips: '2-4-2 배치! 윈도우 쪽 2인석(A-B 또는 H-J)이 가장 편안해요'
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
    tips: '좌석 피치 좁아요! 소형 캐리어만 가능 (높이 23cm 이하)'
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
  recommended: '추천 좌석',
  allowed: '탑승 가능',
  blocked: '탑승 불가',
  exit: '비상구열',
  empty: ''
};

// ============================================================
// 개별 좌석 컴포넌트
// ============================================================
function Seat({
  row, col, status, isSelected, onSelect
}: {
  row: number;
  col: string;
  status: SeatStatus;
  isSelected: boolean;
  onSelect: () => void;
}) {
  if (col === '_') return <div className="w-4 sm:w-6" />;

  const colors = STATUS_COLORS[status];
  const isClickable = status === 'recommended' || status === 'allowed';

  return (
    <motion.button
      whileTap={isClickable ? { scale: 0.9 } : undefined}
      onClick={isClickable ? onSelect : undefined}
      disabled={!isClickable}
      className="relative flex items-center justify-center rounded-[4px] text-[9px] sm:text-[10px] font-semibold transition-all duration-150"
      style={{
        width: '28px',
        height: '28px',
        backgroundColor: isSelected ? colors.border : colors.bg,
        border: `1.5px solid ${colors.border}`,
        color: isSelected ? '#FFFFFF' : colors.text,
        cursor: isClickable ? 'pointer' : 'default',
        opacity: status === 'blocked' ? 0.5 : 1,
      }}
    >
      {col}
      {status === 'recommended' && !isSelected && (
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00C471]" />
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
    <div className="flex items-center gap-[2px] sm:gap-1">
      {/* 행 번호 */}
      <div className="w-6 text-right text-[10px] sm:text-[11px] font-medium" style={{
        color: isExit ? '#F04452' : isBulkhead ? '#FF6B35' : '#8B95A1'
      }}>
        {row}
      </div>

      {/* 좌석들 */}
      <div className="flex gap-[2px] sm:gap-[3px]">
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
        <span className="text-[9px] text-[#F04452] font-medium ml-1">EXIT</span>
      )}
    </div>
  );
}

// ============================================================
// 메인: SeatMap 컴포넌트
// ============================================================
export default function SeatMap({
  airlineCode = 'KE',
  onSeatSelect
}: {
  airlineCode?: string;
  onSeatSelect?: (seatId: string, aircraft: string) => void;
}) {
  const [selectedAircraft, setSelectedAircraft] = useState(0);
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

  const current = availableAircraft[selectedAircraft] || availableAircraft[0];
  if (!current) return null;

  // 표시할 행 범위 (중앙 일부분만 — 전체는 너무 길어서)
  const displayStart = current.rowStart;
  const displayEnd = Math.min(current.rowStart + 20, current.rowEnd);
  const rows = Array.from(
    { length: displayEnd - displayStart + 1 },
    (_, i) => displayStart + i
  );

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(prev => prev === seatId ? null : seatId);
    onSeatSelect?.(seatId, current.code);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto font-pretendard">
      {/* 기종 선택 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-3 px-1 scrollbar-hide">
        {availableAircraft.map((aircraft, idx) => (
          <motion.button
            key={aircraft.code}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setSelectedAircraft(idx); setSelectedSeat(null); }}
            className="flex-shrink-0 px-3 py-2 rounded-[20px] text-[13px] font-semibold transition-all"
            style={{
              backgroundColor: idx === selectedAircraft ? '#3182F6' : '#F2F4F6',
              color: idx === selectedAircraft ? '#FFFFFF' : '#4E5968',
            }}
          >
            {aircraft.name}
          </motion.button>
        ))}
      </div>

      {/* 기종 정보 카드 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.code}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* 적합도 배지 + 정보 */}
          <div className="bg-white rounded-[16px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-[17px] font-bold" style={{ color: '#191F28' }}>
                  {current.name}
                </h3>
                <p className="text-[13px]" style={{ color: '#8B95A1' }}>
                  좌석 배치: {current.layout}
                </p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-[20px]"
                style={{
                  backgroundColor: current.petScore >= 4 ? '#E8F9EF' : current.petScore >= 3 ? '#E8F0FE' : '#FFF3E8',
                  color: current.petScore >= 4 ? '#00C471' : current.petScore >= 3 ? '#3182F6' : '#FF6B35',
                }}>
                <span className="text-[12px]">🐾</span>
                <span className="text-[13px] font-bold">{current.petLabel}</span>
              </div>
            </div>
            <p className="text-[14px] leading-[1.5]" style={{ color: '#333D4B' }}>
              {current.tips}
            </p>
          </div>

          {/* 범례 */}
          <div className="flex flex-wrap gap-3 mb-4 px-1">
            {(['recommended', 'allowed', 'blocked', 'exit'] as SeatStatus[]).map(status => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-[2px]" style={{
                  backgroundColor: STATUS_COLORS[status].bg,
                  border: `1px solid ${STATUS_COLORS[status].border}`,
                }} />
                <span className="text-[11px]" style={{ color: '#4E5968' }}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            ))}
          </div>

          {/* 좌석 배치도 (비행기 형태) */}
          <div className="bg-[#FAFBFC] rounded-[16px] p-3 sm:p-4 overflow-x-auto">
            {/* 기수 방향 */}
            <div className="flex justify-center mb-3">
              <div className="text-[11px] font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: '#E8F0FE', color: '#3182F6' }}>
                ✈ 기수 방향 (앞)
              </div>
            </div>

            {/* 열 헤더 */}
            <div className="flex items-center gap-[2px] sm:gap-1 mb-2">
              <div className="w-6" />
              <div className="flex gap-[2px] sm:gap-[3px]">
                {current.columns.map((col, idx) => (
                  <div key={idx} className="flex items-center justify-center text-[10px] font-bold"
                    style={{
                      width: col === '_' ? '16px' : '28px',
                      color: current.recommendedCols.includes(col) ? '#00C471' : '#8B95A1'
                    }}>
                    {col === '_' ? '' : col}
                  </div>
                ))}
              </div>
            </div>

            {/* 좌석 행들 */}
            <div className="flex flex-col gap-[2px] sm:gap-1">
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
            <div className="text-center mt-3">
              <span className="text-[11px]" style={{ color: '#8B95A1' }}>
                ↓ {displayEnd < current.rowEnd ? `${current.rowEnd}열까지 계속` : '마지막 열'}
              </span>
            </div>
          </div>

          {/* 선택된 좌석 정보 */}
          <AnimatePresence>
            {selectedSeat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-3 bg-white rounded-[16px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-[20px] font-bold"
                    style={{ backgroundColor: '#E8F9EF', color: '#00C471' }}>
                    {selectedSeat}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold" style={{ color: '#191F28' }}>
                      {selectedSeat}석을 선택했어요
                    </p>
                    <p className="text-[13px]" style={{ color: '#8B95A1' }}>
                      {current.recommendedCols.includes(selectedSeat.slice(-1))
                        ? '🐾 반려동물 추천 윈도우석이에요!'
                        : '탑승 가능한 좌석이에요'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

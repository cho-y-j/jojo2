import { FullAnalysisRequestSchema } from '@/lib/schemas';
import regulationsData from '@/data/regulations.json';
import airlinesData from '@/data/airlines.json';

interface AirlinePolicy {
  code: string;
  nameKo: string;
  nameEn: string;
  cabinAllowed: boolean;
  cabinMaxKg: number;
  cabinCageSize: string;
  cabinFeeKRW: number;
  cabinFeeIntlKRW: string;
  cargoAllowed: boolean;
  cargoMaxKg: number | null;
  cargoFeeKRW: string;
  brachycephalicRestricted: boolean;
  hotWeatherRestricted: boolean;
  policyUrl: string;
  notes: string;
  lastVerified: string;
}

interface TransportResult {
  mode: 'CABIN' | 'CARGO' | 'CABIN_ONLY' | 'NOT_AVAILABLE';
  reason: string;
}

function determineTransportMode(
  petWeight: number,
  isBrachycephalic: boolean,
  airline: AirlinePolicy,
): TransportResult {
  if (!airline.cabinAllowed && !airline.cargoAllowed) {
    return { mode: 'NOT_AVAILABLE', reason: '이 항공사는 반려동물 운송을 지원하지 않아요' };
  }

  if (!airline.cabinAllowed) {
    if (airline.cargoAllowed) {
      return { mode: 'CARGO', reason: '이 항공사는 화물 운송만 가능해요' };
    }
    return { mode: 'NOT_AVAILABLE', reason: '이 항공사는 반려동물 운송을 지원하지 않아요' };
  }

  if (isBrachycephalic && airline.brachycephalicRestricted) {
    if (!airline.cargoAllowed) {
      return { mode: 'NOT_AVAILABLE', reason: '단두종은 이 항공사에서 탑승이 제한돼요' };
    }
    return { mode: 'CABIN_ONLY', reason: '단두종은 기내 탑승만 가능해요 (화물칸 위험)' };
  }

  if (petWeight <= airline.cabinMaxKg) {
    return { mode: 'CABIN', reason: '기내 반입 가능해요!' };
  }

  if (airline.cargoAllowed && airline.cargoMaxKg && petWeight <= airline.cargoMaxKg) {
    return { mode: 'CARGO', reason: `체중이 ${airline.cabinMaxKg}kg을 초과해서 화물 운송이 필요해요` };
  }

  if (!airline.cargoAllowed) {
    return { mode: 'NOT_AVAILABLE', reason: `체중이 ${airline.cabinMaxKg}kg을 초과하고, 이 항공사는 화물 운송을 지원하지 않아요` };
  }

  return { mode: 'NOT_AVAILABLE', reason: '체중이 허용 범위를 초과해요' };
}

interface TimelineItem {
  dDay: string;
  date: string;
  title: string;
  description: string;
  isRequired: boolean;
  estimatedCost: string;
  issueMethod: string;
}

function generateTimeline(
  departureDate: string,
  regulations: Array<{
    animalType: string;
    documentName: string;
    description: string;
    daysBeforeDeparture: number;
    isRequired: boolean;
    issueMethod: string;
    estimatedCost: string;
    notes: string;
  }>,
  animalType: string,
): TimelineItem[] {
  const departure = new Date(departureDate);

  const applicableRegs = regulations.filter(
    (reg) => reg.animalType === 'ALL' || reg.animalType === animalType.toUpperCase(),
  );

  const sorted = [...applicableRegs].sort(
    (a, b) => b.daysBeforeDeparture - a.daysBeforeDeparture,
  );

  return sorted.map((reg) => {
    const targetDate = new Date(departure);
    targetDate.setDate(targetDate.getDate() - reg.daysBeforeDeparture);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dDay: string;
    if (diffDays > 0) {
      dDay = `D-${diffDays}`;
    } else if (diffDays === 0) {
      dDay = 'D-Day';
    } else {
      dDay = `D+${Math.abs(diffDays)} (기한 경과)`;
    }

    return {
      dDay,
      date: targetDate.toISOString().split('T')[0],
      title: reg.documentName,
      description: reg.description,
      isRequired: reg.isRequired,
      estimatedCost: reg.estimatedCost,
      issueMethod: reg.issueMethod,
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parseResult = FullAnalysisRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          error: '입력 데이터가 올바르지 않습니다',
        },
        { status: 400 },
      );
    }

    const { petInfo, flightInfo } = parseResult.data;

    const country = regulationsData.countries.find(
      (c) => c.code === flightInfo.destination_country_code,
    );

    if (!country) {
      return Response.json(
        {
          success: false,
          error: `${flightInfo.destination_country_ko}(${flightInfo.destination_country_code})은 아직 지원하지 않는 국가예요. 현재 일본, 미국, 태국, 베트남, 대만만 지원합니다.`,
        },
        { status: 404 },
      );
    }

    const airline = airlinesData.airlines.find(
      (a) => a.code === flightInfo.airline_code,
    ) as AirlinePolicy | undefined;

    if (!airline) {
      return Response.json(
        {
          success: false,
          error: `${flightInfo.airline_name_ko}(${flightInfo.airline_code})의 정책 정보를 찾을 수 없어요`,
        },
        { status: 404 },
      );
    }

    const transportResult = determineTransportMode(
      petInfo.estimated_weight_kg,
      petInfo.is_brachycephalic,
      airline,
    );

    const timeline = generateTimeline(
      flightInfo.departure_date,
      country.regulations,
      petInfo.animal_type,
    );

    const totalEstimatedCost = country.regulations
      .filter(
        (reg) =>
          reg.animalType === 'ALL' ||
          reg.animalType === petInfo.animal_type.toUpperCase(),
      )
      .reduce((sum, reg) => {
        const match = reg.estimatedCost.match(/[\d,]+/);
        if (match) {
          return sum + parseInt(match[0].replace(/,/g, ''), 10);
        }
        return sum;
      }, 0);

    const fullAnalysis = {
      pet: {
        animal_type: petInfo.animal_type,
        breed_ko: petInfo.breed_ko,
        breed_en: petInfo.breed_en,
        estimated_weight_kg: petInfo.estimated_weight_kg,
        is_brachycephalic: petInfo.is_brachycephalic,
        size_category: petInfo.size_category,
      },
      flight: {
        airline_code: flightInfo.airline_code,
        airline_name_ko: flightInfo.airline_name_ko,
        flight_number: flightInfo.flight_number,
        departure_date: flightInfo.departure_date,
        departure_airport: flightInfo.departure_airport,
        arrival_airport: flightInfo.arrival_airport,
        destination_country_code: flightInfo.destination_country_code,
        destination_country_ko: flightInfo.destination_country_ko,
      },
      destination: {
        code: country.code,
        nameKo: country.nameKo,
        nameEn: country.nameEn,
        officialSource: country.officialSource,
      },
      transport: {
        mode: transportResult.mode,
        reason: transportResult.reason,
        airline_policy: {
          cabinAllowed: airline.cabinAllowed,
          cabinMaxKg: airline.cabinMaxKg,
          cabinCageSize: airline.cabinCageSize,
          cabinFeeKRW: airline.cabinFeeKRW,
          cabinFeeIntlKRW: airline.cabinFeeIntlKRW,
          cargoAllowed: airline.cargoAllowed,
          cargoMaxKg: airline.cargoMaxKg,
          cargoFeeKRW: airline.cargoFeeKRW,
          brachycephalicRestricted: airline.brachycephalicRestricted,
          hotWeatherRestricted: airline.hotWeatherRestricted,
          notes: airline.notes,
          policyUrl: airline.policyUrl,
        },
      },
      timeline,
      totalEstimatedCost: `약 ${totalEstimatedCost.toLocaleString()}원`,
      warnings: generateWarnings(petInfo, airline, transportResult),
    };

    return Response.json({ success: true, data: fullAnalysis });
  } catch (error) {
    console.error('[POST /api/analyze/full] Error:', error);
    return Response.json(
      { success: false, error: '통합 분석 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}

function generateWarnings(
  petInfo: { is_brachycephalic: boolean; estimated_weight_kg: number; size_category: string },
  airline: AirlinePolicy,
  transport: TransportResult,
): string[] {
  const warnings: string[] = [];

  if (petInfo.is_brachycephalic) {
    warnings.push('단두종(단코종)은 호흡기 문제로 항공 운송 시 특별한 주의가 필요해요');
  }

  if (airline.hotWeatherRestricted) {
    warnings.push('이 항공사는 고온 시 화물 운송이 제한될 수 있어요 (6~9월 주의)');
  }

  if (transport.mode === 'CARGO') {
    warnings.push('화물 운송 시 IATA 규격 케이지가 필요하며, 출발 4시간 전 화물터미널 도착을 권장해요');
  }

  if (transport.mode === 'NOT_AVAILABLE') {
    warnings.push('현재 조건으로는 이 항공사 이용이 어려워요. 다른 항공사를 검토해보세요');
  }

  if (petInfo.estimated_weight_kg > 30) {
    warnings.push('대형견은 운송 가능한 항공사가 제한적이에요');
  }

  return warnings;
}

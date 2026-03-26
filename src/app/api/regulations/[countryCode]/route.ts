import regulationsData from '@/data/regulations.json';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ countryCode: string }> },
) {
  try {
    const { countryCode } = await params;
    const code = countryCode.toUpperCase();

    const country = regulationsData.countries.find((c) => c.code === code);

    if (!country) {
      return Response.json(
        {
          success: false,
          error: `${code} 국가의 검역 규정 정보를 찾을 수 없어요. 현재 JP, US, TH, VN, TW만 지원합니다.`,
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: {
        code: country.code,
        nameKo: country.nameKo,
        nameEn: country.nameEn,
        officialSource: country.officialSource,
        regulations: country.regulations,
      },
    });
  } catch (error) {
    console.error('[GET /api/regulations/[countryCode]] Error:', error);
    return Response.json(
      { success: false, error: '규정 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}

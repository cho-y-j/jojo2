import airlinesData from '@/data/airlines.json';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ airlineCode: string }> },
) {
  try {
    const { airlineCode } = await params;
    const code = airlineCode.toUpperCase();

    const airline = airlinesData.airlines.find((a) => a.code === code);

    if (!airline) {
      return Response.json(
        {
          success: false,
          error: `${code} 항공사의 정책 정보를 찾을 수 없어요. 현재 KE, OZ, 7C, LJ, TW, BX만 지원합니다.`,
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: airline,
    });
  } catch (error) {
    console.error('[GET /api/airlines/[airlineCode]] Error:', error);
    return Response.json(
      { success: false, error: '항공사 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}

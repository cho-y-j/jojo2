import type { NextRequest } from 'next/server';
import facilitiesData from '@/data/facilities.json';

export async function GET(request: NextRequest) {
  try {
    const terminal = request.nextUrl.searchParams.get('terminal');

    let items = facilitiesData.facilities;

    if (terminal) {
      items = items.filter((item) => item.terminal === terminal.toUpperCase());
    }

    return Response.json({
      success: true,
      data: {
        lastUpdated: facilitiesData.lastUpdated,
        petRules: facilitiesData.petRules,
        items,
      },
    });
  } catch (error) {
    console.error('[GET /api/airport/facilities] Error:', error);
    return Response.json(
      { success: false, error: '시설 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}

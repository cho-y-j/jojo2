import type { NextRequest } from 'next/server';
import { getCongestion } from '@/lib/incheon-api';

export async function GET(request: NextRequest) {
  try {
    const terminal = request.nextUrl.searchParams.get('terminal') ?? undefined;

    const data = await getCongestion(terminal);

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('[GET /api/airport/congestion] Error:', error);
    return Response.json(
      {
        success: false,
        error: '혼잡도 정보를 불러오는 중 오류가 발생했습니다. 실시간 정보가 아닐 수 있어요.',
      },
      { status: 502 },
    );
  }
}

import { analyzeWithRetry } from '@/lib/gemini';
import { FLIGHT_OCR_PROMPT } from '@/lib/prompts/flight-ocr';
import { FlightOcrSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return Response.json(
        { success: false, error: '이미지 파일이 필요합니다' },
        { status: 400 },
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(imageFile.type)) {
      return Response.json(
        { success: false, error: '지원하지 않는 이미지 형식입니다 (JPEG, PNG, WebP, HEIC만 가능)' },
        { status: 400 },
      );
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (imageFile.size > maxSizeBytes) {
      return Response.json(
        { success: false, error: '이미지 크기가 10MB를 초과합니다' },
        { status: 400 },
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const rawResult = await analyzeWithRetry(
      FLIGHT_OCR_PROMPT,
      imageBuffer,
      imageFile.type,
    );

    const parseResult = FlightOcrSchema.safeParse(rawResult);

    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          error: '항공편 정보를 추출하지 못했습니다. 다시 시도하거나 직접 입력해주세요.',
        },
        { status: 422 },
      );
    }

    return Response.json({ success: true, data: parseResult.data });
  } catch (error) {
    console.error('[POST /api/analyze/flight] Error:', error);
    return Response.json(
      { success: false, error: '항공편 분석 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}

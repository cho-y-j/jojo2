import { analyzeWithRetry } from '@/lib/gemini';
import { PHOTO_ANALYSIS_PROMPT } from '@/lib/prompts/photo-analysis';
import { PhotoAnalysisSchema } from '@/lib/schemas';

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
      PHOTO_ANALYSIS_PROMPT,
      imageBuffer,
      imageFile.type,
    );

    const parseResult = PhotoAnalysisSchema.safeParse(rawResult);

    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          error: 'AI 분석 결과를 검증하지 못했습니다. 다시 시도해주세요.',
        },
        { status: 422 },
      );
    }

    return Response.json({ success: true, data: parseResult.data });
  } catch (error) {
    console.error('[POST /api/analyze/photo] Error:', error);
    return Response.json(
      { success: false, error: '사진 분석 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}

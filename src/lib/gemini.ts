import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0,
  },
});

export async function analyzeWithRetry<T = unknown>(
  prompt: string,
  image?: Buffer,
  mimeType: string = 'image/jpeg',
  maxRetries: number = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 이미지를 먼저 보내고 프롬프트를 뒤에 (이미지 인식 정확도 향상)
      const parts: Parameters<typeof model.generateContent>[0] = image
        ? [
            {
              inlineData: {
                mimeType,
                data: image.toString('base64'),
              },
            },
            prompt,
          ]
        : [prompt];

      const result = await model.generateContent(parts);
      const text = result.response.text();
      return JSON.parse(text) as T;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      const delayMs = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Unreachable: max retries exceeded');
}

export { model };

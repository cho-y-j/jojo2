import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetPort — 반려동물 해외여행 AI 도우미",
  description:
    "반려동물 사진 한 장 + 항공편 정보만 입력하면, AI가 검역 서류, 운송 규정, 공항 시설까지 한 번에 정리해줘요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body
        className="min-h-full bg-toss-gray-50"
        style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
      >
        <div className="mx-auto max-w-[430px] min-h-screen bg-white relative shadow-[0_0_40px_rgba(0,0,0,0.05)]">
          {children}
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollRestorer from "@/components/ScrollRestorer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "개발자 포트폴리오 & 기술 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/*
          페이지 렌더링 전에 실행되는 인라인 스크립트.
          localStorage → OS preference 순으로 읽어서 <html>에 .dark 클래스를 즉시 적용.
          이렇게 하면 hydration 전에도 테마가 확정되므로 navbar 배경색 flash가 사라짐.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ScrollRestorer />
        <Navbar />
        <div className="pt-[72px]">{children}</div>
      </body>
    </html>
  );
}

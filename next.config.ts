import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 외부 이미지 도메인 허용 (OAuth 프로필 이미지 등)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth 프로필
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub OAuth 프로필
      },
      {
        protocol: "https",
        hostname: "k.kakaocdn.net", // Kakao OAuth 프로필
      },
    ],
  },

  // 환경변수 검증 (빌드 시 누락되면 에러)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
};

export default nextConfig;

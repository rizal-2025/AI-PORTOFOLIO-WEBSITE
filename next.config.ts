import type { NextConfig } from "next";

export function resolveNextOutputMode(
  vercel: string | undefined,
): NextConfig["output"] {
  return vercel === "1" ? undefined : "standalone";
}

const output = resolveNextOutputMode(process.env.VERCEL);
const nextConfig: NextConfig = {
  ...(output === undefined ? {} : { output }),
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

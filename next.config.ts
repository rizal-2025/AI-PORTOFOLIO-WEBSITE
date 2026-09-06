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
  async rewrites() {
    return [
      {
        source: "/spline-wasm/process.wasm",
        destination:
          "https://unpkg.com/@splinetool/modelling-wasm@1.10.29/build/process.wasm",
      },
      {
        source: "/spline-wasm/boolean.wasm",
        destination:
          "https://unpkg.com/@splinetool/boolean-wasm@1.10.29/build/boolean.wasm",
      },
    ];
  },
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

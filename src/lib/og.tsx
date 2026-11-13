import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export async function renderBrandOgImage() {
  const logoBytes = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0d2b21 0%, #12382c 55%, #087a5c 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Logo Clutch"
            width={56}
            height={56}
            style={{ borderRadius: "14px", background: "#ffffff", padding: "6px" }}
          />
          <span style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Clutch
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "960px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "58px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            <span>Trouver son professeur particulier,</span>
            <span style={{ color: "#7ee8c9" }}>simplement et gratuitement.</span>
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: "rgba(255,255,255,0.82)", lineHeight: 1.35 }}>
            Maths, sciences, langues et méthode en Belgique et à distance. 0 % de commission.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "22px",
            color: "#7ee8c9",
            fontWeight: 700,
          }}
        >
          <span>clutch.education</span>
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>
            Chez le professeur · Chez l’élève · À distance
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "./site-config";

export const alt = `${SITE_NAME} — an over-the-top bingo caller`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PINK = "#ec4899";
const GOLD = "#f5b91d";

export default async function Image() {
  const queenData = await readFile(
    join(process.cwd(), "public/queen-1-transparent.png"),
  );
  const queenSrc = `data:image/png;base64,${queenData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#050507",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 680,
          }}
        >
          <div
            style={{
              display: "flex",
              color: GOLD,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Bingo Night
          </div>
          <div
            style={{
              display: "flex",
              color: PINK,
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.75)",
              fontSize: 28,
            }}
          >
            Sassy live commentary. Real bingo numbers. Zero setup.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 420,
            height: 420,
            borderRadius: "50%",
            overflow: "hidden",
            border: `6px solid ${PINK}`,
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={queenSrc}
            width={420}
            height={420}
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}

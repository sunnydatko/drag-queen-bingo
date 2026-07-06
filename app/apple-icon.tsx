import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#db2777",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            background: "white",
            clipPath:
              "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 34,
            right: 34,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#f5b91d",
          }}
        />
      </div>
    ),
    { ...size },
  );
}

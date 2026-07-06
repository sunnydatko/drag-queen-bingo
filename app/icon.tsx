import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#db2777",
          borderRadius: "50%",
          border: "2px solid #f5b91d",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 18,
            height: 18,
            background: "white",
            clipPath:
              "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}

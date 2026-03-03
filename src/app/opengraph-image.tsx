import { ImageResponse } from "next/og";

export const alt = "Côté-Cour – Application pour apprendre son texte de théâtre et mémoriser ses répliques";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f9f7f3 0%, #f4c95d22 25%, #ff6b6b22 75%, #3b1f4a18 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#3b1f4a",
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Côté-Cour
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#524b5a",
              maxWidth: 800,
              lineHeight: 1.35,
            }}
          >
            Apprends ton texte de théâtre et mémorise tes répliques 3x plus vite
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#7a7184",
              marginTop: 24,
            }}
          >
            Application pour comédiens
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

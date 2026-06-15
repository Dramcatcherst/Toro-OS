import { ImageResponse } from "next/og";

export const alt = "Dreamcatcher Hotel Santa Teresa — boutique hotel, villas and buyouts";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #120f0b 0%, #2c7466 48%, #f7d7a6 100%)",
          color: "#fff8ed",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 18%, rgba(247,215,166,0.46), transparent 24%), radial-gradient(circle at 80% 72%, rgba(18,15,11,0.48), transparent 34%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: "100%", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, letterSpacing: 5, textTransform: "uppercase", fontWeight: 800 }}>
            <span>Dreamcatcher Hotel</span>
            <span>Santa Teresa</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 850 }}>
            <div style={{ fontSize: 86, lineHeight: 0.92, letterSpacing: -5, fontWeight: 900 }}>
              Boutique hotel, private villas and buyout inquiries.
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.35, color: "rgba(255,248,237,0.82)", maxWidth: 760 }}>
              Direct booking intent, wellness, surf, groups and Santa Teresa travel planning — confirmed by Dreamcatcher/Kross.
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 24, fontWeight: 800 }}>
            {['Rooms', 'Villas', 'Wellness', 'Surf', 'Buyouts'].map((item) => (
              <span key={item} style={{ border: "1px solid rgba(255,248,237,0.32)", borderRadius: 999, padding: "12px 20px", background: "rgba(18,15,11,0.24)" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}

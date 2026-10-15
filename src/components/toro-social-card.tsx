export function ToroSocialCard() {
  return (
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #010511 0%, #052456 58%, #084A8F 100%)",
        color: "#f8fafc",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "2px solid rgba(57,178,240,.48)",
          boxShadow: "0 30px 90px rgba(0,0,0,.32)",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          padding: "62px 70px",
          width: "100%",
        }}
      >
        <div style={{ color: "#39B2F0", display: "flex", fontSize: 74, fontWeight: 800, letterSpacing: "0.06em" }}>
          TORO
        </div>
        <div style={{ color: "#F9DB83", display: "flex", fontSize: 26, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Operation System
        </div>
        <div style={{ display: "flex", fontSize: 46, fontWeight: 650, lineHeight: 1.15, maxWidth: "850px" }}>
          Operación conectada con contexto, permisos y evidencia.
        </div>
      </div>
    </div>
  );
}

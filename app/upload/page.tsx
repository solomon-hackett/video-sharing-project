import Form from "@/app/ui/videos/upload-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [callbackUrl: string]: string }>;
}) {
  const callback = (await searchParams).callbackUrl ?? "/";
  return (
    <main
      style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radial glow backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "10%",
          left: "30%",
          width: "400px",
          height: "300px",
          background:
            "radial-gradient(ellipse, rgba(167,139,250,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <span
            className="navbar__logo"
            style={{
              fontSize: "1.6rem",
              display: "block",
              marginBottom: "var(--space-3)",
            }}
          >
            SoloStream
          </span>
          <h1
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "var(--space-1)",
            }}
          >
            Upload a new video
          </h1>
        </div>
        <Form />
      </div>
    </main>
  );
}

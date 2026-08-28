const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "clamp(3.5rem, 10vw, 6rem) 1.5rem",
        background:
          "radial-gradient(120% 100% at 50% 0%, var(--background) 0%, var(--beige-dark) 100%)",
        textAlign: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="YALM Events"
        style={{ width: "clamp(220px, 32vw, 380px)", height: "auto" }}
      />
      <p
        style={{
          fontFamily: "var(--font-serif), serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1.05rem, 2.4vw, 1.4rem)",
          color: "var(--bordeaux)",
          margin: 0,
        }}
      >
        {SLOGAN}
      </p>
    </section>
  );
}

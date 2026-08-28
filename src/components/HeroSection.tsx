const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "clamp(3.5rem, 10vw, 6rem) 1.5rem",
        background: "linear-gradient(180deg, #4a1015 0%, #320a0e 100%)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display), serif",
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          letterSpacing: "0.08em",
          color: "#e0c674",
          margin: 0,
        }}
      >
        YALM EVENTS
      </h1>
      <p
        style={{
          fontFamily: "var(--font-script), cursive",
          fontSize: "clamp(1.25rem, 3.2vw, 2rem)",
          color: "rgba(255,248,220,0.92)",
          margin: 0,
        }}
      >
        {SLOGAN}
      </p>
    </section>
  );
}

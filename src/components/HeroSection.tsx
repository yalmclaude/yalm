const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        padding: "clamp(3.5rem, 10vw, 6rem) 1.5rem",
        background: "linear-gradient(180deg, var(--bordeaux) 0%, var(--bordeaux-dark) 100%)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-serif), serif",
          fontSize: "clamp(2.75rem, 8vw, 4.5rem)",
          lineHeight: 1,
          color: "var(--gold-light)",
          margin: 0,
        }}
      >
        yalm
      </h1>
      <p
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: "clamp(0.75rem, 1.6vw, 0.95rem)",
          fontWeight: 600,
          letterSpacing: "0.4em",
          color: "rgba(255,248,220,0.85)",
          margin: 0,
          textTransform: "uppercase",
        }}
      >
        Events
      </p>
      <p
        style={{
          fontFamily: "var(--font-serif), serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1.05rem, 2.4vw, 1.4rem)",
          color: "rgba(255,248,220,0.75)",
          margin: "0.5rem 0 0",
        }}
      >
        {SLOGAN}
      </p>
    </section>
  );
}

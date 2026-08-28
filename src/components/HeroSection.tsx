const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "clamp(3.5rem, 10vw, 6rem) 1.5rem",
        background: "linear-gradient(180deg, var(--bordeaux) 0%, var(--bordeaux-dark) 100%)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "var(--background)",
          borderRadius: "clamp(12px, 2vw, 20px)",
          padding: "clamp(1.25rem, 3vw, 2rem) clamp(1.75rem, 4vw, 3rem)",
          boxShadow: "0 20px 50px -20px rgba(0,0,0,0.45)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="YALM Events"
          style={{ width: "clamp(200px, 28vw, 340px)", height: "auto", display: "block" }}
        />
      </div>
      <p
        style={{
          fontFamily: "var(--font-serif), serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1.05rem, 2.4vw, 1.4rem)",
          color: "var(--gold-light)",
          margin: 0,
        }}
      >
        {SLOGAN}
      </p>
    </section>
  );
}

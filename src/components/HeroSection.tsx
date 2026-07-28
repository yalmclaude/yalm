const SLOGAN = "Your Amazing Life Moments";

export function HeroSection() {
  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)",
        background: "radial-gradient(120% 100% at 50% 0%, #fbf3e6 0%, #f2e3cd 55%, #e8d3b3 100%)",
      }}
    >
      <div
        className="hero-fade-in"
        style={{
          position: "relative",
          width: "min(100%, 1100px)",
          display: "flex",
          height: "clamp(280px, 48vw, 520px)",
          borderRadius: "clamp(10px, 1.4vw, 18px)",
          overflow: "hidden",
          boxShadow:
            "0 40px 90px -30px rgba(74,16,21,0.4), 0 0 0 1px rgba(201,162,39,0.35)",
        }}
      >
        <div
          style={{
            width: "50%",
            height: "100%",
            backgroundImage: "url('/hero-exterior.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            width: "50%",
            height: "100%",
            backgroundImage: "url('/hero-interior.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* liseré doré entre les 2 photos */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: "2px",
            height: "100%",
            marginLeft: "-1px",
            background: "rgba(201,162,39,0.7)",
          }}
        />

        {/* voile + slogan */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "clamp(1.25rem, 4vw, 2.5rem)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: "clamp(1.5rem, 4.2vw, 3rem)",
              color: "rgba(255,248,220,0.97)",
              letterSpacing: "0.04em",
              textShadow: "0 2px 30px rgba(0,0,0,0.8)",
            }}
          >
            {SLOGAN}
          </p>
        </div>
      </div>
    </section>
  );
}

import { useId } from "react";

/**
 * Logo Yasix Merch (SVG inline, tanpa file gambar).
 *
 * variant : "icon" = perisai saja | "full" = perisai + tulisan
 * theme   : "light" = untuk latar terang | "dark" = untuk latar gelap (panel bg-dark)
 * size    : tinggi ikon dalam px (tulisan menyesuaikan otomatis)
 * tagline : tampilkan "SMK YADIKA 6 JATIWARINGIN" di bawah nama (hanya variant "full")
 */
export default function YasixLogo({
  variant = "full",
  theme = "light",
  size = 48,
  tagline = true,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const gb = `gb-${uid}`;
  const gf = `gf-${uid}`;
  const dark = theme === "dark";

  const icon = (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role={variant === "icon" ? "img" : undefined}
      aria-label={variant === "icon" ? "Logo Yasix Merch" : undefined}
      aria-hidden={variant === "icon" ? undefined : true}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gb} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B6FD6" />
          <stop offset="1" stopColor="#0B2D6B" />
        </linearGradient>
        <linearGradient id={gf} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#E5202A" />
          <stop offset="1" stopColor="#FF8A1F" />
        </linearGradient>
      </defs>
      <path
        d="M60 6 L110 44 L92 110 L28 110 L10 44 Z"
        fill={`url(#${gb})`}
        stroke={`url(#${gb})`}
        strokeWidth="8"
        strokeLinejoin="round"
      />
      {dark && (
        <path
          d="M60 6 L110 44 L92 110 L28 110 L10 44 Z"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="9"
          strokeLinejoin="round"
        />
      )}
      {/* api / obor */}
      <path
        d="M60 18 C66 26 72 32 69 38 C67 43 53 43 51 38 C48 32 54 26 60 18 Z"
        fill={`url(#${gf})`}
      />
      {/* huruf A */}
      <path
        d="M60 42 L86 100 L75 100 L60 68 L45 100 L34 100 Z"
        fill="#FFFFFF"
      />
      <rect x="48" y="86" width="24" height="6" rx="1" fill="#FFD21F" />
      {/* padi (kiri) */}
      <ellipse
        cx="27"
        cy="62"
        rx="2.6"
        ry="5.5"
        fill="#FFD21F"
        transform="rotate(-30 27 62)"
      />
      <ellipse
        cx="29"
        cy="72"
        rx="2.6"
        ry="5.5"
        fill="#FFD21F"
        transform="rotate(-30 29 72)"
      />
      <ellipse
        cx="32"
        cy="82"
        rx="2.6"
        ry="5.5"
        fill="#FFD21F"
        transform="rotate(-30 32 82)"
      />
      {/* kapas (kanan) */}
      <circle cx="93" cy="62" r="3.2" fill="#FFFFFF" />
      <circle cx="91" cy="72" r="3.2" fill="#FFFFFF" />
      <circle cx="88" cy="82" r="3.2" fill="#FFFFFF" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <span className={className} style={{ display: "inline-flex" }}>
        {icon}
      </span>
    );
  }

  const nameSize = Math.round(size * 0.62);
  const tagSize = Math.max(8, Math.round(size * 0.17));

  return (
    <div
      className={className}
      role="img"
      aria-label="Logo Yasix Merch"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(size * 0.25),
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {icon}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: Math.round(size * 0.08),
        }}
      >
        <div
          style={{
            fontSize: nameSize,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: dark ? "#FFFFFF" : "#0B2D6B",
          }}
        >
          <span style={{ fontWeight: 800 }}>Yasix</span>{" "}
          <span
            style={{ fontWeight: 500, color: dark ? "#8DB8FF" : "#1F5FC2" }}
          >
            Merch
          </span>
        </div>
        {tagline && (
          <div
            style={{
              fontSize: tagSize,
              letterSpacing: "0.22em",
              fontWeight: 500,
              color: dark ? "#C3D3EE" : "#4A5568",
              whiteSpace: "nowrap",
            }}
          >
            SMK YADIKA 6 JATIWARINGIN
          </div>
        )}
      </div>
    </div>
  );
}

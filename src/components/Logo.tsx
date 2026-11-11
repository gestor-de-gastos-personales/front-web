interface LogoProps {
  size?: number;
}

/** Marca Mangos: mango con hoja y tallo, sin fondo (hereda el del contenedor). */
export function Logo({ size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20 20c12-8 27-1 26 14-1 13-16 19-25 12-8-6-10-19-1-26Z"
        fill="var(--mango)"
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M17 39c3 8 15 12 23 6 4-3 6-8 6-11-3 8-12 12-20 10-4-1-7-3-9-5Z"
        fill="var(--coral)"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M38 16c6-7 16-7 19-2-4 8-13 10-19 7Z"
        fill="var(--leaf)"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M38 17c-2 2-3 5-2 8"
        stroke="var(--stem)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M24 26c2-5 7-7 11-6"
        stroke="var(--mango-light)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

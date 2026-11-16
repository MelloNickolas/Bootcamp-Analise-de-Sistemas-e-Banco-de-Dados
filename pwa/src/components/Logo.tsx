export function Logo({ tamanho = 44 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" fill="none" role="img" aria-label="Tomodachi">
      <defs>
        <linearGradient id="logo-ouro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EBD9AE" />
          <stop offset="1" stopColor="#C4A468" />
        </linearGradient>
      </defs>
      <rect x="20" y="44" width="60" height="40" rx="7" fill="url(#logo-ouro)" />
      <path d="M18 27 L82 15 L85 31 L21 43 Z" fill="url(#logo-ouro)" />
      <path d="M33 38 L41 25 M49 35 L57 22 M65 32 L73 19" stroke="#20252D" strokeWidth="5" strokeLinecap="round" />
      <path d="M44 56 L44 73 L60 64.5 Z" fill="#20252D" />
    </svg>
  );
}

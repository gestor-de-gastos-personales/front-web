import { useId } from 'react';

interface LogoProps {
  size?: number;
}

const CUERPO =
  'M45.4263,13.1171a8.0385,8.0385,0,0,1,2.0928.8837c4.3283,2.4312,8.0059,6.3592,8.8956,11.3845A17.9766,17.9766,0,0,1,54.8753,35.56a27.03,27.03,0,0,1-8.7037,10.9286c-3.0374,2.2395-6.6036,3.8921-8.9708,6.8311-2.2373,2.7778-3.4393,6.7023-6.704,8.1389a8.0769,8.0769,0,0,1-5.0875.2532C9.7017,57.9836,11.8612,34.58,19.1466,24.6047l.0236-.0323a27.44,27.44,0,0,1,12.9367-9.3981C35.8208,13.8322,41.4419,12.2085,45.4263,13.1171Z';

const HOJA =
  'M40,11.4526s-3.8987,6.1329-9.4684,7.9047S18,18.6758,18,18.6758s3.8987-6.1329,9.4684-7.9047S40,11.4526,40,11.4526Z';

const HOJA_SOMBRA =
  'M40 11.45C34 13.6 28 16 18 18.7c8 1.4 16-1 22-7.2Z';

/**
 * Marca Mangos: mango anaranjado con base coral, hoja verde y tallo marrón
 * sobre el azul de la marca. Silueta base OpenMoji (CC-BY-SA 4.0).
 */
export function Logo({ size = 40 }: LogoProps) {
  const clipId = `mangos-cuerpo-${useId().replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={CUERPO} />
        </clipPath>
      </defs>

      <rect width="72" height="72" rx="14" fill="var(--mangos-blue)" />

      <g transform="translate(-2.6 0) scale(1.08 1)">
        <path fill="var(--mango)" d={CUERPO} />
        <g clipPath={`url(#${clipId})`}>
          <path fill="var(--coral)" d="M-5 40C15 52 45 55 80 38V80H-5Z" />
        </g>
        <path
          d="M27 25C21 31 19 38 21 45"
          fill="none"
          stroke="var(--mango-light)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      <g transform="translate(41 15) scale(1.28) rotate(-14) translate(-41 -15)">
        <path
          fill="var(--leaf)"
          transform="translate(82 0) scale(-1 1)"
          d={HOJA}
        />
        <path
          fill="var(--leaf-dark)"
          transform="translate(82 0) scale(-1 1)"
          d={HOJA_SOMBRA}
        />
      </g>

      <path
        d="M41 15 L46 9"
        fill="none"
        stroke="var(--stem)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

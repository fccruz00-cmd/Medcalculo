import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Base comum: traço de 1.75, cantos arredondados, herda `currentColor`. */
function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 13 4 4 10-10" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}

export function PrintIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 9V4h10v5" />
      <path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="15" width="10" height="6" rx="1" />
    </Icon>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 11a8 8 0 0 0-14-4.5L4 9" />
      <path d="M4 5v4h4" />
      <path d="M4 13a8 8 0 0 0 14 4.5L20 15" />
      <path d="M20 19v-4h-4" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.75h.01" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.3 4.3 2.6 17.6A2 2 0 0 0 4.3 20.6h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 10v4" />
      <path d="M12 17.5h.01" />
    </Icon>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 17.5h15" />
    </Icon>
  );
}

export function StarIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Icon fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17l-5.3 2.7 1.1-5.9L3.5 9.7l5.9-.8z" />
    </Icon>
  );
}

export function CalculatorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </Icon>
  );
}

/* ---------------------------------------------------------------- */
/* Ícones de especialidade                                           */
/* ---------------------------------------------------------------- */

const SPECIALTY_PATHS: Record<string, React.ReactNode> = {
  Cardiologia: (
    <>
      <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.6c0 5-7 9.4-7 9.4Z" />
      <path d="M4 14h3l1.5-2.5L11 16l2-6 1.5 4H20" />
    </>
  ),
  Pneumologia: (
    <>
      <path d="M12 4v9" />
      <path d="M12 9c0-1.5-1-2.5-2.5-2.5S7 8 6.5 10c-.6 2.3-.9 4.3-1 6.3A2 2 0 0 0 7.6 18.4l1.8-.4A2 2 0 0 0 11 16V13" />
      <path d="M13 13v3a2 2 0 0 0 1.6 2l1.8.4a2 2 0 0 0 2.1-2.1c-.1-2-.4-4-1-6.3C17 8 16 6.5 14.5 6.5S13 7.5 13 9" />
    </>
  ),
  Neurologia: (
    <>
      <path d="M9.5 4.5A3 3 0 0 0 6 7.4 2.6 2.6 0 0 0 4.5 10c0 .9.4 1.7 1 2.2A2.8 2.8 0 0 0 5 14.5a2.8 2.8 0 0 0 2.4 2.8A2.7 2.7 0 0 0 10 20a2 2 0 0 0 2-2V5.9a2 2 0 0 0-2.5-1.4Z" />
      <path d="M14.5 4.5A3 3 0 0 1 18 7.4a2.6 2.6 0 0 1 1.5 2.6c0 .9-.4 1.7-1 2.2a2.8 2.8 0 0 1 .5 2.3 2.8 2.8 0 0 1-2.4 2.8A2.7 2.7 0 0 1 14 20a2 2 0 0 1-2-2" />
    </>
  ),
  Nefrologia: (
    <>
      <path d="M9 3.5C6.5 3.5 5 6 5 9.5c0 4 1.5 7 2.5 9 .7 1.4 2.6 1.3 3.1-.2.4-1.1.4-2.4.4-3.8V8c0-2.6-.9-4.5-2-4.5Z" />
      <path d="M15 3.5c2.5 0 4 2.5 4 6 0 4-1.5 7-2.5 9-.7 1.4-2.6 1.3-3.1-.2-.4-1.1-.4-2.4-.4-3.8V8c0-2.6.9-4.5 2-4.5Z" />
    </>
  ),
  Gastroenterologia: (
    <>
      <path d="M8 3v4c0 3.5 1.5 4.5 4 5s4 2 4 4.5A4.5 4.5 0 0 1 11.5 21C9 21 7.5 19.5 7.5 17" />
      <path d="M6 3h4" />
    </>
  ),
  Hepatologia: (
    <>
      <path d="M4 8.5C4 6.6 5.6 5 7.5 5H16c2.8 0 5 2.2 5 5 0 4.4-3.6 8-8 8H9a5 5 0 0 1-5-5Z" />
      <path d="M11 5c-.5 3.5-1 6-4 8" />
    </>
  ),
  Emergência: (
    <>
      <path d="M3 15h4l2-4 3 7 2.5-5 1.5 2h5" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </>
  ),
  'Terapia Intensiva': (
    <>
      <rect x="2.5" y="5" width="19" height="12" rx="2" />
      <path d="M6 11h2.5l1.5-3 2 6 1.5-3H18" />
      <path d="M9 20h6" />
      <path d="M12 17v3" />
    </>
  ),
  Infectologia: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
    </>
  ),
  Hematologia: (
    <>
      <path d="M12 3s6 6.6 6 10.4A6 6 0 0 1 6 13.4C6 9.6 12 3 12 3Z" />
      <path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  Endocrinologia: (
    <>
      <path d="M7 4c0 2.5 10 2.5 10 0" />
      <path d="M7 4v3c0 3 10 3 10 0V4" />
      <path d="M6 12.5c1.5-1.5 4-1.5 6 0s4.5 1.5 6 0" />
      <path d="M6 17c1.5-1.5 4-1.5 6 0s4.5 1.5 6 0" />
    </>
  ),
  Obstetrícia: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="13" cy="12.5" r="3.5" />
      <path d="M13 9V6.5" />
    </>
  ),
  Pediatria: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M10 7.5h.01M14 7.5h.01" />
    </>
  ),
  Psiquiatria: (
    <>
      <path d="M12 21a9 9 0 1 0-9-9c0 1.6.4 3.1 1.1 4.4L3 21l4.6-1.1A9 9 0 0 0 12 21Z" />
      <path d="M9.5 12a2.5 2.5 0 0 1 5 0c0 1.5-2.5 1.8-2.5 3.2" />
    </>
  ),
  Ortopedia: (
    <>
      <path d="M6.5 3.5a2.2 2.2 0 0 0-2 3.3 2.2 2.2 0 0 0 1.2 3.3l7.5 7.5a2.2 2.2 0 0 0 3.3 1.2 2.2 2.2 0 0 0 3.3-2 2.2 2.2 0 0 0-2-3.3 2.2 2.2 0 0 0-1.2-3.3L9.1 2.7" />
      <path d="M4.5 6.8 2.7 8.6" />
    </>
  ),
  Oncologia: (
    <>
      <path d="M12 20c-2.5-3.5-5-5.5-5-9a5 5 0 0 1 10 0c0 3.5-2.5 5.5-5 9Z" />
      <path d="M9 20h6" />
      <circle cx="12" cy="11" r="2" />
    </>
  ),
  Cirurgia: (
    <>
      <path d="M4 20 14.5 9.5" />
      <path d="M13 8 17 4l3 3-4 4z" />
      <path d="M4 20h3l1-3" />
    </>
  ),
  Reumatologia: (
    <>
      <path d="M8 4v5.5a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 0 3 14.5V20" />
      <path d="M16 4v5.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 1 21 14.5V20" />
      <path d="M8 12h8" />
    </>
  ),
  Urologia: (
    <>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 4-2 7.5-6 7.5S6 13.5 6 9.5Z" />
      <path d="M12 17v4" />
      <path d="M9.5 6.5C10.5 5 13.5 5 14.5 6.5" />
    </>
  ),
  Geriatria: (
    <>
      <circle cx="10" cy="6" r="3" />
      <path d="M10 9c-2.5 0-4 1.8-4 4v8" />
      <path d="M10 21v-5" />
      <path d="M17 8v13" />
      <path d="M15 8h4" />
    </>
  ),
  Anestesiologia: (
    <>
      <path d="m14 3 7 7" />
      <path d="M17.5 6.5 8 16v3H5l9.5-9.5" />
      <path d="M11 9.5 14.5 13" />
    </>
  ),
  'Clínica Médica': (
    <>
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M4 3h4M12 3h4" />
      <path d="M10 12v3a4 4 0 0 0 8 0v-1" />
      <circle cx="18" cy="10" r="2" />
    </>
  ),
  Otorrinolaringologia: (
    <>
      <path d="M7 9a5 5 0 0 1 10 0c0 3-2 4-3 5.5S13 18 13 19a2.5 2.5 0 0 1-5 0" />
      <path d="M10 9a2 2 0 0 1 4 0" />
    </>
  ),
  Toxicologia: (
    <>
      <path d="M9 3h6v4l4 9.5A3 3 0 0 1 16.2 21H7.8A3 3 0 0 1 5 16.5L9 7z" />
      <path d="M6.5 14h11" />
      <path d="M12 10.5v3M10.5 12h3" />
    </>
  ),
};

export function SpecialtyIcon({
  specialty,
  ...props
}: IconProps & { specialty: string }) {
  const path = SPECIALTY_PATHS[specialty] ?? SPECIALTY_PATHS['Clínica Médica'];
  return <Icon {...props}>{path}</Icon>;
}

// Metadados e SVGs para tipos de caminhão e carroceria.
// Usados nas páginas nova-carga, detalhe-carga e cargas (listagem).

export const TRUCK_SVG_MAP: Record<string, { capacity: string; svgStr: string }> = {
  'VUC': {
    capacity: 'até 1,5 t',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="10" width="40" height="18" rx="2"/>
      <line x1="17" y1="10" x2="17" y2="28"/>
      <path d="M3 22 L13 10"/>
      <circle cx="10" cy="33" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="36" cy="33" r="3.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  '3/4': {
    capacity: '1,5–3 t',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="12" width="13" height="16" rx="2"/>
      <path d="M3 22 L10 12"/>
      <rect x="17" y="13" width="26" height="15" rx="1"/>
      <line x1="3" y1="28" x2="43" y2="28"/>
      <circle cx="9" cy="33" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="34" cy="33" r="3.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  'Toco': {
    capacity: 'até 7 t',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="13" height="17" rx="2"/>
      <path d="M3 22 L10 11"/>
      <rect x="17" y="9" width="34" height="19" rx="1"/>
      <line x1="3" y1="28" x2="51" y2="28"/>
      <circle cx="9" cy="33" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="43" cy="33" r="3.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  'Truck': {
    capacity: 'até 14 t',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="10" width="13" height="18" rx="2"/>
      <path d="M3 22 L10 10"/>
      <rect x="17" y="7" width="42" height="21" rx="1"/>
      <line x1="3" y1="28" x2="59" y2="28"/>
      <circle cx="9" cy="33" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="46" cy="33" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="53" cy="33" r="3.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  'Bitruck': {
    capacity: 'até 23 t',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="10" width="13" height="18" rx="2"/>
      <path d="M2 22 L9 10"/>
      <rect x="16" y="6" width="52" height="22" rx="1"/>
      <line x1="2" y1="28" x2="68" y2="28"/>
      <circle cx="8" cy="33" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="44" cy="33" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="52" cy="33" r="3.5" fill="currentColor" stroke="none"/>
      <circle cx="61" cy="33" r="3.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  'Carreta Simples': {
    capacity: 'até 33 t',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="15" width="12" height="13" rx="2"/>
      <path d="M2 23 L8 15"/>
      <rect x="15" y="20" width="7" height="8" rx="1"/>
      <line x1="22" y1="24" x2="26" y2="24"/>
      <rect x="26" y="7" width="44" height="21" rx="1"/>
      <line x1="2" y1="28" x2="70" y2="28"/>
      <circle cx="7" cy="33" r="3" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="33" r="3" fill="currentColor" stroke="none"/>
      <circle cx="22" cy="33" r="3" fill="currentColor" stroke="none"/>
      <circle cx="52" cy="33" r="3" fill="currentColor" stroke="none"/>
      <circle cx="60" cy="33" r="3" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  'Carreta Bitrem': {
    capacity: 'até 57 t',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="16" width="11" height="12" rx="2"/>
      <path d="M1 23 L6 16"/>
      <rect x="13" y="21" width="6" height="7" rx="1"/>
      <line x1="19" y1="24" x2="22" y2="24"/>
      <rect x="22" y="9" width="21" height="19" rx="1"/>
      <line x1="43" y1="19" x2="46" y2="19"/>
      <rect x="46" y="9" width="24" height="19" rx="1"/>
      <line x1="1" y1="28" x2="70" y2="28"/>
      <circle cx="6" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="14" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="19" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="32" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="38" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="55" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="62" cy="33" r="2.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  'Carreta Rodotrem': {
    capacity: 'até 74 t',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="17" width="10" height="11" rx="2"/>
      <path d="M1 23 L6 17"/>
      <rect x="12" y="22" width="6" height="6" rx="1"/>
      <line x1="18" y1="25" x2="21" y2="25"/>
      <rect x="21" y="6" width="49" height="22" rx="1"/>
      <line x1="1" y1="28" x2="70" y2="28"/>
      <circle cx="5" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="18" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="31" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="39" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="50" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="58" cy="33" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="65" cy="33" r="2.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
};

export const BODY_SVG_MAP: Record<string, { label: string; svgStr: string }> = {
  'Baú': {
    label: 'Fechado, carga seca',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="6" width="48" height="26" rx="2"/>
      <line x1="4" y1="19" x2="52" y2="19"/>
      <line x1="42" y1="6" x2="42" y2="32"/>
      <rect x="43" y="16" width="5" height="8" rx="1"/>
    </svg>`,
  },
  'Sider': {
    label: 'Lonas laterais removíveis',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="6" width="48" height="26" rx="2"/>
      <line x1="14" y1="7" x2="14" y2="31" stroke-dasharray="3 2"/>
      <line x1="23" y1="7" x2="23" y2="31" stroke-dasharray="3 2"/>
      <line x1="32" y1="7" x2="32" y2="31" stroke-dasharray="3 2"/>
      <line x1="41" y1="7" x2="41" y2="31" stroke-dasharray="3 2"/>
    </svg>`,
  },
  'Graneleiro': {
    label: 'Grãos e minérios',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 6 L50 6 L46 32 L10 32 Z"/>
      <path d="M10 18 Q28 13 46 18" stroke-width="1"/>
      <path d="M12 26 Q28 20 44 26" stroke-width="1"/>
    </svg>`,
  },
  'Tanque': {
    label: 'Líquidos e gases',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="28" cy="20" rx="23" ry="13"/>
      <ellipse cx="28" cy="7" rx="4" ry="2.5"/>
      <line x1="10" y1="31" x2="10" y2="36"/>
      <line x1="46" y1="31" x2="46" y2="36"/>
    </svg>`,
  },
  'Frigorífico': {
    label: 'Carga refrigerada',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="6" width="48" height="26" rx="2"/>
      <line x1="4" y1="19" x2="52" y2="19"/>
      <line x1="28" y1="9" x2="28" y2="17"/>
      <line x1="24" y1="11" x2="32" y2="15"/>
      <line x1="32" y1="11" x2="24" y2="15"/>
      <circle cx="28" cy="9" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="28" cy="17" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  'Prancha': {
    label: 'Cargas longas e pesadas',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="22" width="50" height="7" rx="1"/>
      <line x1="10" y1="22" x2="10" y2="16"/>
      <line x1="20" y1="22" x2="20" y2="16"/>
      <line x1="30" y1="22" x2="30" y2="16"/>
      <line x1="40" y1="22" x2="40" y2="16"/>
      <line x1="10" y1="16" x2="40" y2="16"/>
    </svg>`,
  },
  'Cegonheira': {
    label: 'Transporte de veículos',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="32" x2="52" y2="32"/>
      <path d="M4 32 L8 18 L52 18"/>
      <path d="M8 18 L10 6 L52 6"/>
      <rect x="12" y="3" width="11" height="6" rx="2"/>
      <rect x="30" y="3" width="11" height="6" rx="2"/>
      <rect x="20" y="15" width="11" height="6" rx="2"/>
    </svg>`,
  },
  'Porta-Container': {
    label: 'Containers ISO',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="6" width="48" height="26" rx="1"/>
      <line x1="22" y1="6" x2="22" y2="32"/>
      <line x1="38" y1="6" x2="38" y2="32"/>
      <rect x="4" y="6" width="4" height="4" rx="0.5" fill="currentColor" stroke="none"/>
      <rect x="48" y="6" width="4" height="4" rx="0.5" fill="currentColor" stroke="none"/>
      <rect x="4" y="28" width="4" height="4" rx="0.5" fill="currentColor" stroke="none"/>
      <rect x="48" y="28" width="4" height="4" rx="0.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  'Caçamba': {
    label: 'Terra, entulho e minério',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 7 L50 7 L50 32 L6 32 Z"/>
      <line x1="16" y1="7" x2="16" y2="32"/>
      <line x1="28" y1="7" x2="28" y2="32"/>
      <line x1="40" y1="7" x2="40" y2="32"/>
      <line x1="6" y1="7" x2="6" y2="32" stroke-width="3"/>
    </svg>`,
  },
  'Munck': {
    label: 'Com guindaste integrado',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="22" width="32" height="10" rx="1"/>
      <rect x="32" y="14" width="8" height="10" rx="1"/>
      <line x1="36" y1="14" x2="50" y2="3" stroke-width="2"/>
      <line x1="50" y1="3" x2="52" y2="14" stroke-dasharray="2 1.5"/>
      <path d="M52 14 Q54 16 52 18 Q50 20 50 18"/>
    </svg>`,
  },
  'Aberto': {
    label: 'Plataforma descoberta',
    svgStr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="24" width="50" height="8" rx="1"/>
      <line x1="11" y1="24" x2="11" y2="14"/>
      <line x1="21" y1="24" x2="21" y2="14"/>
      <line x1="31" y1="24" x2="31" y2="14"/>
      <line x1="41" y1="24" x2="41" y2="14"/>
      <line x1="11" y1="14" x2="41" y2="14"/>
    </svg>`,
  },
};

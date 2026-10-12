'use client';

import React, { useState } from 'react';

interface AmcConfig {
  shortName: string;
  slug?: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
}

const AMC_DIRECTORY: Record<string, AmcConfig> = {
  hdfc: {
    shortName: 'HDFC',
    slug: 'hdfc',
    bg: 'bg-[#003B70]/15',
    border: 'border-[#003B70]/30',
    text: 'text-[#5B9BD5]',
    accent: '#003B70'
  },
  sbi: {
    shortName: 'SBI',
    slug: 'sbi',
    bg: 'bg-[#1A539B]/15',
    border: 'border-[#1A539B]/30',
    text: 'text-[#4A90E2]',
    accent: '#1A539B'
  },
  icici: {
    shortName: 'ICICI',
    slug: 'icici',
    bg: 'bg-[#DE5B26]/15',
    border: 'border-[#DE5B26]/30',
    text: 'text-[#F58220]',
    accent: '#DE5B26'
  },
  quant: {
    shortName: 'QUANT',
    slug: 'quant',
    bg: 'bg-[#00A389]/15',
    border: 'border-[#00A389]/30',
    text: 'text-[#00F090]',
    accent: '#00A389'
  },
  nippon: {
    shortName: 'NIPPON',
    slug: 'nippon',
    bg: 'bg-[#E60028]/15',
    border: 'border-[#E60028]/30',
    text: 'text-[#FF4D4D]',
    accent: '#E60028'
  },
  axis: {
    shortName: 'AXIS',
    slug: 'axis',
    bg: 'bg-[#97144D]/15',
    border: 'border-[#97144D]/30',
    text: 'text-[#D8236B]',
    accent: '#97144D'
  },
  kotak: {
    shortName: 'KOTAK',
    slug: 'kotak',
    bg: 'bg-[#ED1C24]/15',
    border: 'border-[#ED1C24]/30',
    text: 'text-[#FF5252]',
    accent: '#ED1C24'
  },
  parag: {
    shortName: 'PPFAS',
    slug: 'ppfas',
    bg: 'bg-[#4B6B40]/15',
    border: 'border-[#4B6B40]/30',
    text: 'text-[#7CB342]',
    accent: '#4B6B40'
  },
  ppfas: {
    shortName: 'PPFAS',
    slug: 'ppfas',
    bg: 'bg-[#4B6B40]/15',
    border: 'border-[#4B6B40]/30',
    text: 'text-[#7CB342]',
    accent: '#4B6B40'
  },
  mirae: {
    shortName: 'MIRAE',
    slug: 'mirae',
    bg: 'bg-[#004B87]/15',
    border: 'border-[#004B87]/30',
    text: 'text-[#389FD6]',
    accent: '#004B87'
  },
  tata: {
    shortName: 'TATA',
    slug: 'tata',
    bg: 'bg-[#00529B]/15',
    border: 'border-[#00529B]/30',
    text: 'text-[#4A90E2]',
    accent: '#00529B'
  },
  uti: {
    shortName: 'UTI',
    slug: 'uti',
    bg: 'bg-[#E36C09]/15',
    border: 'border-[#E36C09]/30',
    text: 'text-[#FF9800]',
    accent: '#E36C09'
  },
  motilal: {
    shortName: 'MOSL',
    slug: 'motilal',
    bg: 'bg-[#D32F2F]/15',
    border: 'border-[#D32F2F]/30',
    text: 'text-[#EF5350]',
    accent: '#D32F2F'
  },
  dsp: {
    shortName: 'DSP',
    slug: 'dsp',
    bg: 'bg-[#2E7D32]/15',
    border: 'border-[#2E7D32]/30',
    text: 'text-[#66BB6A]',
    accent: '#2E7D32'
  },
  bandhan: {
    shortName: 'BANDHAN',
    slug: 'bandhan',
    bg: 'bg-[#9C27B0]/15',
    border: 'border-[#9C27B0]/30',
    text: 'text-[#BA68C8]',
    accent: '#9C27B0'
  },
  canara: {
    shortName: 'CANARA',
    slug: 'canara_robeco',
    bg: 'bg-[#0288D1]/15',
    border: 'border-[#0288D1]/30',
    text: 'text-[#29B6F6]',
    accent: '#0288D1'
  },
  edelweiss: {
    shortName: 'EDELWEISS',
    slug: 'edelweiss',
    bg: 'bg-[#3F51B5]/15',
    border: 'border-[#3F51B5]/30',
    text: 'text-[#7986CB]',
    accent: '#3F51B5'
  },
  invesco: {
    shortName: 'INVESCO',
    slug: 'invesco',
    bg: 'bg-[#004B87]/15',
    border: 'border-[#004B87]/30',
    text: 'text-[#389FD6]',
    accent: '#004B87'
  },
  franklin: {
    shortName: 'FRANKLIN',
    slug: 'franklin',
    bg: 'bg-[#002D62]/15',
    border: 'border-[#002D62]/30',
    text: 'text-[#4A90E2]',
    accent: '#002D62'
  },
  sundaram: {
    shortName: 'SUNDARAM',
    slug: 'sundaram',
    bg: 'bg-[#008080]/15',
    border: 'border-[#008080]/30',
    text: 'text-[#20B2AA]',
    accent: '#008080'
  },
  hsbc: {
    shortName: 'HSBC',
    slug: 'hsbc',
    bg: 'bg-[#DB0011]/15',
    border: 'border-[#DB0011]/30',
    text: 'text-[#FF4D4D]',
    accent: '#DB0011'
  },
  whiteoak: {
    shortName: 'WHITEOAK',
    slug: 'whiteoak',
    bg: 'bg-[#4B6B40]/15',
    border: 'border-[#4B6B40]/30',
    text: 'text-[#7CB342]',
    accent: '#4B6B40'
  },
  mahindra: {
    shortName: 'MAHINDRA',
    slug: 'mahindra',
    bg: 'bg-[#ED1C24]/15',
    border: 'border-[#ED1C24]/30',
    text: 'text-[#FF5252]',
    accent: '#ED1C24'
  },
  bajaj: {
    shortName: 'BAJAJ',
    slug: 'bajaj',
    bg: 'bg-[#00529B]/15',
    border: 'border-[#00529B]/30',
    text: 'text-[#4A90E2]',
    accent: '#00529B'
  },
  pgim: {
    shortName: 'PGIM',
    slug: 'pgim',
    bg: 'bg-[#003B70]/15',
    border: 'border-[#003B70]/30',
    text: 'text-[#5B9BD5]',
    accent: '#003B70'
  },
  navi: {
    shortName: 'NAVI',
    slug: 'navi',
    bg: 'bg-[#00A389]/15',
    border: 'border-[#00A389]/30',
    text: 'text-[#00F090]',
    accent: '#00A389'
  },
  groww: {
    shortName: 'GROWW',
    slug: 'groww',
    bg: 'bg-[#00D09C]/15',
    border: 'border-[#00D09C]/30',
    text: 'text-[#00D09C]',
    accent: '#00D09C'
  },
  'bank of india': {
    shortName: 'BOI',
    slug: 'bank_of_india',
    bg: 'bg-[#F26522]/15',
    border: 'border-[#F26522]/30',
    text: 'text-[#F58220]',
    accent: '#F26522'
  },
  boi: {
    shortName: 'BOI',
    slug: 'bank_of_india',
    bg: 'bg-[#F26522]/15',
    border: 'border-[#F26522]/30',
    text: 'text-[#F58220]',
    accent: '#F26522'
  },
  baroda: {
    shortName: 'BARODA',
    slug: 'baroda_bnp',
    bg: 'bg-[#F26522]/15',
    border: 'border-[#F26522]/30',
    text: 'text-[#F58220]',
    accent: '#F26522'
  },
  jm: {
    shortName: 'JM',
    slug: 'jm_financial',
    bg: 'bg-[#003B70]/15',
    border: 'border-[#003B70]/30',
    text: 'text-[#5B9BD5]',
    accent: '#003B70'
  },
  lic: {
    shortName: 'LIC',
    slug: 'lic',
    bg: 'bg-[#00529B]/15',
    border: 'border-[#00529B]/30',
    text: 'text-[#4A90E2]',
    accent: '#00529B'
  },
  union: {
    shortName: 'UNION',
    slug: 'union',
    bg: 'bg-[#ED1C24]/15',
    border: 'border-[#ED1C24]/30',
    text: 'text-[#FF5252]',
    accent: '#ED1C24'
  },
  iti: {
    shortName: 'ITI',
    slug: 'iti',
    bg: 'bg-[#1A539B]/15',
    border: 'border-[#1A539B]/30',
    text: 'text-[#4A90E2]',
    accent: '#1A539B'
  },
  '360': {
    shortName: '360 ONE',
    slug: '360_one',
    bg: 'bg-[#141B2D]/15',
    border: 'border-[#141B2D]/30',
    text: 'text-[#38bdf8]',
    accent: '#141B2D'
  },
  taurus: {
    shortName: 'TAURUS',
    slug: 'taurus',
    bg: 'bg-[#D32F2F]/15',
    border: 'border-[#D32F2F]/30',
    text: 'text-[#EF5350]',
    accent: '#D32F2F'
  },
  quantum: {
    shortName: 'QUANTUM',
    slug: 'quantum',
    bg: 'bg-[#2E7D32]/15',
    border: 'border-[#2E7D32]/30',
    text: 'text-[#66BB6A]',
    accent: '#2E7D32'
  },
  shriram: {
    shortName: 'SHRIRAM',
    slug: 'shriram',
    bg: 'bg-[#F58220]/15',
    border: 'border-[#F58220]/30',
    text: 'text-[#F58220]',
    accent: '#F58220'
  },
  nj: {
    shortName: 'NJ',
    slug: 'nj',
    bg: 'bg-[#0288D1]/15',
    border: 'border-[#0288D1]/30',
    text: 'text-[#29B6F6]',
    accent: '#0288D1'
  },
  trust: {
    shortName: 'TRUST',
    slug: 'trust',
    bg: 'bg-[#003B70]/15',
    border: 'border-[#003B70]/30',
    text: 'text-[#5B9BD5]',
    accent: '#003B70'
  },
  samco: {
    shortName: 'SAMCO',
    slug: 'samco',
    bg: 'bg-[#DE5B26]/15',
    border: 'border-[#DE5B26]/30',
    text: 'text-[#F58220]',
    accent: '#DE5B26'
  },
  helios: {
    shortName: 'HELIOS',
    slug: 'helios',
    bg: 'bg-[#E36C09]/15',
    border: 'border-[#E36C09]/30',
    text: 'text-[#FF9800]',
    accent: '#E36C09'
  },
  'old bridge': {
    shortName: 'OLD BRIDGE',
    slug: 'old_bridge',
    bg: 'bg-[#4B6B40]/15',
    border: 'border-[#4B6B40]/30',
    text: 'text-[#7CB342]',
    accent: '#4B6B40'
  },
  capitalmind: {
    shortName: 'CAPITALMIND',
    slug: 'capitalmind',
    bg: 'bg-[#00A389]/15',
    border: 'border-[#00A389]/30',
    text: 'text-[#00F090]',
    accent: '#00A389'
  },
  blackrock: {
    shortName: 'JIO BLACKROCK',
    slug: 'jio_blackrock',
    bg: 'bg-[#000000]/15',
    border: 'border-[#000000]/30',
    text: 'text-[#94A3B8]',
    accent: '#000000'
  },
  jio: {
    shortName: 'JIO BLACKROCK',
    slug: 'jio_blackrock',
    bg: 'bg-[#000000]/15',
    border: 'border-[#000000]/30',
    text: 'text-[#94A3B8]',
    accent: '#000000'
  },
  unifi: {
    shortName: 'UNIFI',
    slug: 'unifi',
    bg: 'bg-[#3F51B5]/15',
    border: 'border-[#3F51B5]/30',
    text: 'text-[#7986CB]',
    accent: '#3F51B5'
  },
  abakkus: {
    shortName: 'ABAKKUS',
    slug: 'abakkus',
    bg: 'bg-[#9C27B0]/15',
    border: 'border-[#9C27B0]/30',
    text: 'text-[#BA68C8]',
    accent: '#9C27B0'
  },
  birla: {
    shortName: 'ABSL',
    slug: 'aditya_birla',
    bg: 'bg-[#D32F2F]/15',
    border: 'border-[#D32F2F]/30',
    text: 'text-[#EF5350]',
    accent: '#D32F2F'
  },
  aditya: {
    shortName: 'ABSL',
    slug: 'aditya_birla',
    bg: 'bg-[#D32F2F]/15',
    border: 'border-[#D32F2F]/30',
    text: 'text-[#EF5350]',
    accent: '#D32F2F'
  }
};

function resolveAmcConfig(rawName: string): AmcConfig {
  const lower = (rawName || '').toLowerCase();
  for (const [key, cfg] of Object.entries(AMC_DIRECTORY)) {
    if (lower.includes(key)) return cfg;
  }

  // Deterministic fallback
  const firstWord = (rawName || 'AMC').split(' ')[0].slice(0, 5).toUpperCase();
  return {
    shortName: firstWord,
    bg: 'bg-surface-container',
    border: 'border-surface-container-high',
    text: 'text-on-surface-variant',
    accent: '#64748B'
  };
}

interface AmcBadgeProps {
  fundHouse: string;
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
  showLogoOnly?: boolean;
  showBadgeText?: boolean;
  className?: string;
}

export const AmcBadge: React.FC<AmcBadgeProps> = ({
  fundHouse,
  size = 'sm',
  showFullName = false,
  showLogoOnly = false,
  showBadgeText = false,
  className = ''
}) => {
  const config = resolveAmcConfig(fundHouse);
  const [imgError, setImgError] = useState(false);

  const basePath =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/BickerBape')
      ? '/BickerBape'
      : '';
  const logoUrl = config.slug ? `${basePath}/logos/amc/${config.slug}.png` : null;

  const avatarSizes = {
    sm: 'w-5 h-5 rounded-md p-0.5',
    md: 'w-7 h-7 rounded-lg p-0.5',
    lg: 'w-9 h-9 rounded-xl p-1'
  };

  const badgeTextSizes = {
    sm: 'text-[9px] px-1.5 py-0.5 font-bold tracking-wider rounded-md',
    md: 'text-[10px] px-2 py-0.5 font-bold tracking-wider rounded-lg',
    lg: 'text-xs px-2.5 py-1 font-extrabold tracking-wider rounded-xl'
  };

  const hasLogo = Boolean(logoUrl && !imgError);

  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      title={`Fund House: ${fundHouse}`}
    >
      {hasLogo ? (
        <div
          className={`flex items-center justify-center bg-white border border-surface-container dark:border-white/10 shadow-2xs overflow-hidden flex-shrink-0 ${avatarSizes[size]}`}
        >
          <img
            src={logoUrl!}
            alt={`${config.shortName} logo`}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      ) : showLogoOnly ? (
        <div
          className={`flex items-center justify-center border font-black uppercase ${config.bg} ${config.border} ${config.text} ${avatarSizes[size]} select-none flex-shrink-0`}
          title={config.shortName}
        >
          <span className={size === 'lg' ? 'text-xs font-bold' : 'text-[9px] font-bold'}>
            {config.shortName.slice(0, 3)}
          </span>
        </div>
      ) : null}

      {/* Show text badge only if explicitly asked, or as fallback when no logo image exists and showLogoOnly is not active */}
      {(showBadgeText || (!hasLogo && !showLogoOnly)) && (
        <span
          className={`font-mono uppercase border ${config.bg} ${config.border} ${config.text} ${badgeTextSizes[size]}`}
        >
          {config.shortName}
        </span>
      )}

      {showFullName && (
        <span className="text-xs text-on-surface-variant truncate font-medium">
          {fundHouse}
        </span>
      )}
    </div>
  );
};

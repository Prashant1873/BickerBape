'use client';

import React from 'react';

interface AmcConfig {
  shortName: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
}

const AMC_DIRECTORY: Record<string, AmcConfig> = {
  hdfc: {
    shortName: 'HDFC',
    bg: 'bg-[#003B70]/15',
    border: 'border-[#003B70]/30',
    text: 'text-[#5B9BD5]',
    accent: '#003B70'
  },
  sbi: {
    shortName: 'SBI',
    bg: 'bg-[#1A539B]/15',
    border: 'border-[#1A539B]/30',
    text: 'text-[#4A90E2]',
    accent: '#1A539B'
  },
  icici: {
    shortName: 'ICICI',
    bg: 'bg-[#DE5B26]/15',
    border: 'border-[#DE5B26]/30',
    text: 'text-[#F58220]',
    accent: '#DE5B26'
  },
  quant: {
    shortName: 'QUANT',
    bg: 'bg-[#00A389]/15',
    border: 'border-[#00A389]/30',
    text: 'text-[#00F090]',
    accent: '#00A389'
  },
  nippon: {
    shortName: 'NIPPON',
    bg: 'bg-[#E60028]/15',
    border: 'border-[#E60028]/30',
    text: 'text-[#FF4D4D]',
    accent: '#E60028'
  },
  axis: {
    shortName: 'AXIS',
    bg: 'bg-[#97144D]/15',
    border: 'border-[#97144D]/30',
    text: 'text-[#D8236B]',
    accent: '#97144D'
  },
  kotak: {
    shortName: 'KOTAK',
    bg: 'bg-[#ED1C24]/15',
    border: 'border-[#ED1C24]/30',
    text: 'text-[#FF5252]',
    accent: '#ED1C24'
  },
  parag: {
    shortName: 'PPFAS',
    bg: 'bg-[#4B6B40]/15',
    border: 'border-[#4B6B40]/30',
    text: 'text-[#7CB342]',
    accent: '#4B6B40'
  },
  ppfas: {
    shortName: 'PPFAS',
    bg: 'bg-[#4B6B40]/15',
    border: 'border-[#4B6B40]/30',
    text: 'text-[#7CB342]',
    accent: '#4B6B40'
  },
  mirae: {
    shortName: 'MIRAE',
    bg: 'bg-[#004B87]/15',
    border: 'border-[#004B87]/30',
    text: 'text-[#389FD6]',
    accent: '#004B87'
  },
  tata: {
    shortName: 'TATA',
    bg: 'bg-[#00529B]/15',
    border: 'border-[#00529B]/30',
    text: 'text-[#4A90E2]',
    accent: '#00529B'
  },
  uti: {
    shortName: 'UTI',
    bg: 'bg-[#E36C09]/15',
    border: 'border-[#E36C09]/30',
    text: 'text-[#FF9800]',
    accent: '#E36C09'
  },
  motilal: {
    shortName: 'MOSL',
    bg: 'bg-[#D32F2F]/15',
    border: 'border-[#D32F2F]/30',
    text: 'text-[#EF5350]',
    accent: '#D32F2F'
  },
  dsp: {
    shortName: 'DSP',
    bg: 'bg-[#2E7D32]/15',
    border: 'border-[#2E7D32]/30',
    text: 'text-[#66BB6A]',
    accent: '#2E7D32'
  },
  bandhan: {
    shortName: 'BANDHAN',
    bg: 'bg-[#9C27B0]/15',
    border: 'border-[#9C27B0]/30',
    text: 'text-[#BA68C8]',
    accent: '#9C27B0'
  },
  canara: {
    shortName: 'CANARA',
    bg: 'bg-[#0288D1]/15',
    border: 'border-[#0288D1]/30',
    text: 'text-[#29B6F6]',
    accent: '#0288D1'
  },
  edelweiss: {
    shortName: 'EDELWEISS',
    bg: 'bg-[#3F51B5]/15',
    border: 'border-[#3F51B5]/30',
    text: 'text-[#7986CB]',
    accent: '#3F51B5'
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
  className?: string;
}

export const AmcBadge: React.FC<AmcBadgeProps> = ({
  fundHouse,
  size = 'sm',
  showFullName = false,
  className = ''
}) => {
  const config = resolveAmcConfig(fundHouse);

  const sizeStyles = {
    sm: 'text-[9px] px-1.5 py-0.5 font-bold tracking-wider rounded-md',
    md: 'text-[10px] px-2 py-0.5 font-bold tracking-wider rounded-lg',
    lg: 'text-xs px-2.5 py-1 font-extrabold tracking-wider rounded-xl'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`font-mono uppercase border ${config.bg} ${config.border} ${config.text} ${sizeStyles[size]} select-none`}
        title={`Fund House: ${fundHouse}`}
      >
        {config.shortName}
      </span>
      {showFullName && (
        <span className="text-xs text-on-surface-variant truncate font-medium">
          {fundHouse}
        </span>
      )}
    </div>
  );
};

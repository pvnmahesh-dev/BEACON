import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'neutral' | 'gradient' | 'pink' | 'mint';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'violet',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    violet: 'bg-[#6434df] text-white border-[#252b3a]',
    cyan: 'bg-[#9bf1cd] text-[#253044] border-[#252b3a]',
    emerald: 'bg-[#9bf1cd] text-[#253044] border-[#252b3a]',
    mint: 'bg-[#9bf1cd] text-[#253044] border-[#252b3a]',
    amber: 'bg-[#ffd05b] text-[#253044] border-[#252b3a]',
    pink: 'bg-[#ff78c5] text-[#253044] border-[#252b3a]',
    neutral: 'bg-white text-[#253044] border-[#252b3a]',
    gradient: 'bg-[#f1ebff] text-[#6434df] border-[#252b3a]',
  };

  const dotColors = {
    violet: 'bg-[#ffd05b]',
    cyan: 'bg-[#6434df]',
    emerald: 'bg-[#253044]',
    mint: 'bg-[#253044]',
    amber: 'bg-[#ff78c5]',
    pink: 'bg-[#6434df]',
    neutral: 'bg-[#6434df]',
    gradient: 'bg-[#ff78c5]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-heading font-bold border-2 shadow-[2px_2px_0px_#252b3a] transition-transform ${variantStyles[variant as keyof typeof variantStyles] || variantStyles.violet} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full border border-[#252b3a] ${dotColors[variant as keyof typeof dotColors] || dotColors.violet}`} />}
      {children}
    </span>
  );
};

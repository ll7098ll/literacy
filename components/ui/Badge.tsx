import React from 'react';

export type BadgeVariant = 
  | 'brand' 
  | 'growth' 
  | 'warmth' 
  | 'danger' 
  | 'slate' 
  | 'purple' 
  | 'outline' 
  | 'stamp' 
  | 'stamp-emerald' 
  | 'stamp-amber';

export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1 font-black rounded-lg',
    md: 'px-3 py-1 text-xs gap-1.5 font-black rounded-xl',
  };

  const variantStyles = {
    brand: 'bg-blue-50 text-blue-800 border-2 border-blue-200 shadow-subtle',
    growth: 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200 shadow-subtle',
    warmth: 'bg-amber-50 text-amber-900 border-2 border-amber-200 shadow-subtle',
    danger: 'bg-rose-50 text-rose-800 border-2 border-rose-200 shadow-subtle',
    slate: 'bg-slate-100 text-slate-800 border-2 border-slate-200/90 shadow-subtle',
    purple: 'bg-purple-50 text-purple-800 border-2 border-purple-200 shadow-subtle',
    outline: 'bg-white text-slate-800 border-2 border-slate-300 shadow-subtle',
    stamp: 'bg-slate-900 text-white border-2 border-slate-900 shadow-tactile-sm',
    'stamp-emerald': 'bg-emerald-700 text-white border-2 border-emerald-900 shadow-tactile-sm',
    'stamp-amber': 'bg-amber-600 text-slate-950 border-2 border-amber-800 shadow-tactile-sm',
  };

  return (
    <span className={`inline-flex items-center tracking-tight select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;

import React from 'react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'soft' 
  | 'warmth' 
  | 'tactile' 
  | 'tactile-emerald' 
  | 'tactile-amber' 
  | 'editorial';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black transition-all duration-100 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white border border-brand-800/80 shadow-tactile-sm active:translate-y-0.5 active:shadow-none tactile-btn',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-950 shadow-tactile-sm active:translate-y-0.5 active:shadow-none tactile-btn',
    outline: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 active:bg-slate-100',
    ghost: 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 font-bold',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-800 shadow-tactile-sm active:translate-y-0.5 active:shadow-none tactile-btn',
    soft: 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/80 font-extrabold active:scale-[0.99]',
    warmth: 'bg-warmth-500 hover:bg-warmth-600 text-white border border-warmth-700 shadow-tactile-sm active:translate-y-0.5 active:shadow-none tactile-btn',
    tactile: 'bg-brand-600 hover:bg-brand-700 text-white border-2 border-slate-900 shadow-tactile active:translate-y-0.5 active:shadow-tactile-pressed tactile-btn',
    'tactile-emerald': 'bg-growth-600 hover:bg-growth-700 text-white border-2 border-slate-900 shadow-tactile active:translate-y-0.5 active:shadow-tactile-pressed tactile-btn',
    'tactile-amber': 'bg-warmth-500 hover:bg-warmth-600 text-slate-900 border-2 border-slate-900 shadow-tactile active:translate-y-0.5 active:shadow-tactile-pressed tactile-btn',
    editorial: 'bg-white hover:bg-[#FAF8F5] text-slate-900 border-2 border-slate-800 shadow-tactile-sm font-serif active:translate-y-0.5 active:shadow-none',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  variant?: 'white' | 'paper' | 'subtle' | 'gradient' | 'tactile' | 'editorial' | 'metric';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  variant = 'white',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4 sm:p-5',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    white: 'bg-white border-2 border-slate-200/90 shadow-card',
    paper: 'bg-[#FAF8F5] border-2 border-[#E8E1D5] shadow-card text-[#1E293B]',
    subtle: 'bg-slate-50/90 border border-slate-200 shadow-subtle',
    gradient: 'bg-gradient-to-br from-white via-white to-blue-50/50 border-2 border-blue-200/80 shadow-card',
    tactile: 'bg-white border-2 border-slate-900 shadow-tactile',
    editorial: 'bg-[#FAF8F5] border border-[#E6DFD5] shadow-subtle text-[#1E293B]',
    metric: 'bg-white border border-slate-200/90 shadow-subtle hover:border-slate-300',
  };

  const interactiveStyles = interactive
    ? variant === 'tactile'
      ? 'transition-all duration-100 hover:-translate-y-0.5 hover:shadow-tactile active:translate-y-0.5 active:shadow-tactile-pressed cursor-pointer'
      : 'transition-all duration-150 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]'
    : '';

  return (
    <div
      className={`rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

'use client';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'white';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', isLoading, children, className, disabled, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md',
    secondary: 'bg-primary-light text-primary hover:bg-emerald-100 focus:ring-primary',
    outline: 'border-2 border-border text-text-primary hover:border-primary hover:text-primary focus:ring-primary bg-transparent',
    ghost: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary focus:ring-gray-300',
    danger: 'bg-error text-white hover:bg-red-600 focus:ring-error',
    accent: 'bg-accent text-white hover:bg-orange-600 focus:ring-accent shadow-sm hover:shadow-md',
    white: 'bg-white text-primary hover:bg-primary hover:text-white hover:-translate-y-1 focus:ring-primary shadow-md hover:shadow-xl',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary:
      'bg-accent-primary text-white hover:bg-accent-hover shadow-lg shadow-accent-primary/20',
    secondary:
      'bg-dark-elevated text-dark-text border border-dark-border hover:bg-dark-border hover:border-dark-text-muted',
    ghost:
      'hover:bg-dark-elevated text-dark-text-secondary hover:text-dark-text',
    outline:
      'border border-dark-border bg-transparent hover:bg-dark-elevated text-dark-text',
    danger:
      'bg-accent-error text-white hover:bg-accent-error/80 shadow-lg shadow-accent-error/20',
  };

  const sizes = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-5 py-2 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-11 w-11',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
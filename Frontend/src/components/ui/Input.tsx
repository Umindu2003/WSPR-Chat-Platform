import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium leading-none text-dark-text-secondary">
            {label}
          </label>
        )}
        <input
          className={`flex h-12 w-full rounded-2xl border border-dark-border bg-dark-elevated px-4 py-2 text-sm text-dark-text ring-offset-dark-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-dark-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-dark-text-muted ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-accent-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
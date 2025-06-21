import { theme } from '@/styles/theme';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        flex-1 px-4 py-2
        border border-gray-200
        rounded-lg
        focus:ring-2 focus:ring-indigo-500
        focus:border-indigo-500
        ${className}
      `}
      {...props}
    />
  );
} 
import { ReactNode, CSSProperties } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  title?: string;
  style?: CSSProperties;
}

export function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  className = '',
  title,
  style,
}: ButtonProps) {
  const baseStyles = `
    px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
  `;

  const variantStyles = {
    primary: `
      bg-indigo-600 text-white
      hover:bg-indigo-700
      focus:ring-indigo-500
      disabled:opacity-50 disabled:cursor-not-allowed
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `,
    secondary: `
      bg-transparent text-gray-600 
      hover:bg-gray-100
      focus:ring-indigo-500
      disabled:opacity-50 disabled:cursor-not-allowed
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      title={title}
      style={style}
    >
      {children}
    </button>
  );
} 
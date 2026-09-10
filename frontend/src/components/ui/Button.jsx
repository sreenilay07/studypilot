import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#172B3A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#172B3A] text-[#F5F1E8] hover:bg-[#0F1E29] border border-[#172B3A]',
    secondary: 'bg-[#F5F1E8] text-[#172B3A] hover:bg-[#EAE4D5] border border-[#172B3A]',
    outline: 'bg-transparent text-[#172B3A] hover:bg-[#172B3A]/5 border border-[#172B3A]/30',
    ghost: 'bg-transparent text-[#172B3A] hover:bg-[#172B3A]/5 border border-transparent'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-sm',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-md font-semibold'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

import React from 'react';

export function LogoMark({ className = 'h-8 w-auto', alt = 'StudyPilot Logo' }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`object-contain ${className}`}
    />
  );
}

export function Logo({
  showTagline = false,
  size = 'md',
  className = '',
  iconOnly = false
}) {
  const heights = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-24'
  };

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <img
        src="/logo.png"
        alt="StudyPilot Logo"
        className={`object-contain ${heights[size] || heights.md}`}
      />
    </div>
  );
}

export default Logo;

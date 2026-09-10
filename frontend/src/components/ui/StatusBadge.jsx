import React from 'react';

export function StatusBadge({ status, className = '' }) {
  const normStatus = (status || '').toString().toLowerCase();

  if (normStatus.includes('strong') || normStatus.includes('mastered')) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold uppercase tracking-wider border-2 border-[#172B3A] text-[#172B3A] bg-[#172B3A]/5 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#172B3A] mr-1.5" />
        Strong
      </span>
    );
  }

  if (normStatus.includes('revision') || normStatus.includes('attention') || normStatus.includes('medium')) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium uppercase tracking-wider border border-[#172B3A]/40 text-[#172B3A]/80 bg-[#172B3A]/5 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full border border-[#172B3A] mr-1.5" />
        Needs Revision
      </span>
    );
  }

  // Weak / Needs Urgence / Low
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider border-2 border-dashed border-[#172B3A] bg-[#172B3A]/10 text-[#172B3A] ${className}`}>
      <span className="font-mono mr-1.5">!</span>
      Weak
    </span>
  );
}

export default StatusBadge;

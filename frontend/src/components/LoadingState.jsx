import React from 'react';
import { BookOpen } from 'lucide-react';

export const LoadingState = ({
  message = 'Preparing your study kit...',
  subtext = 'Analyzing your notes and building targeted revision material.'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] py-12 px-4 text-center">
      <BookOpen className="w-10 h-10 text-[#172B3A] mb-4 animate-pulse" />
      <h3 className="text-lg font-bold font-display text-[#172B3A] mb-1">{message}</h3>
      <p className="text-xs text-[#172B3A]/70 max-w-sm">{subtext}</p>
    </div>
  );
};

export default LoadingState;

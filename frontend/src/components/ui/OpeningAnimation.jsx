import React, { useState, useEffect, useRef } from 'react';

export function OpeningAnimation({ onComplete }) {
  const videoRef = useRef(null);
  const [fading, setFading] = useState(false);

  const handleVideoEnd = () => {
    finishAnimation();
  };

  const finishAnimation = () => {
    setFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600); // 600ms fade transition
  };

  useEffect(() => {
    // Fallback timer in case video autoplay fails or event doesn't trigger
    const fallbackTimer = setTimeout(() => {
      finishAnimation();
    }, 6000);

    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented or video load issue:', err);
      });
    }

    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F5F1E8] transition-opacity duration-600 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative max-w-2xl w-full px-4 flex flex-col items-center justify-center">
        <video
          ref={videoRef}
          src="/opening-animation.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
        />

        <button
          onClick={finishAnimation}
          className="mt-6 text-xs font-mono font-semibold uppercase tracking-widest text-[#172B3A]/60 hover:text-[#172B3A] border border-[#172B3A]/20 hover:border-[#172B3A] px-4 py-1.5 rounded transition-all"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
}

export default OpeningAnimation;

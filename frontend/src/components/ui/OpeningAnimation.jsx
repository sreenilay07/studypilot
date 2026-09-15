import React, { useState, useEffect, useRef } from 'react';

export function OpeningAnimation({ onComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [fading, setFading] = useState(false);

  const finishAnimation = () => {
    setFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  };

  const handleVideoEnd = () => {
    finishAnimation();
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const processFrame = () => {
      if (!video || video.paused || video.ended) return;

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // 1. Render raw video frame to hidden canvas calculation buffer
      ctx.drawImage(video, 0, 0, width, height);

      try {
        // 2. Real-time Luminance-Alpha & Color Balance Compositing
        const frameData = ctx.getImageData(0, 0, width, height);
        const data = frameData.data;
        const len = data.length;

        // Target background color: #F5F1E8 (R: 245, G: 241, B: 232)
        const targetR = 245;
        const targetG = 241;
        const targetB = 232;

        const cx = width / 2;
        const cy = height / 2;
        const maxRadiusX = width * 0.46;
        const maxRadiusY = height * 0.46;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate perceived luminance (ITU-R BT.601)
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // Radial distance calculation for outer frame edge feathering
          const pixelIdx = i / 4;
          const x = pixelIdx % width;
          const y = Math.floor(pixelIdx / width);
          const dx = (x - cx) / maxRadiusX;
          const dy = (y - cy) / maxRadiusY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let radialAlpha = 1.0;
          if (dist > 0.75) {
            const edgeRatio = Math.min(1.0, (dist - 0.75) / 0.25);
            radialAlpha = Math.max(0.0, 1.0 - edgeRatio * edgeRatio);
          }

          // If pixel belongs to light background (lum > 200)
          if (lum > 200) {
            // Smoothstep fade for background luminance (200 -> 250)
            const t = Math.min(1.0, Math.max(0.0, (lum - 200) / 50.0));
            const bgWeight = 1.0 - t * t;

            // Blend pixel color towards page background #F5F1E8
            data[i] = Math.round(r * bgWeight + targetR * (1 - bgWeight));
            data[i + 1] = Math.round(g * bgWeight + targetG * (1 - bgWeight));
            data[i + 2] = Math.round(b * bgWeight + targetB * (1 - bgWeight));

            // Apply alpha mask to eliminate rectangular boundary completely
            data[i + 3] = Math.round(data[i + 3] * bgWeight * radialAlpha);
          } else {
            // Keep foreground artwork crisp with radial edge alpha
            data[i + 3] = Math.round(data[i + 3] * radialAlpha);
          }
        }

        // 3. Put composited pixel data onto display canvas
        ctx.putImageData(frameData, 0, 0);
      } catch (e) {
        // Fallback if canvas security restricts raw pixel read
      }

      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    const handlePlay = () => {
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    video.addEventListener('play', handlePlay);

    // Fallback timer
    const fallbackTimer = setTimeout(() => {
      finishAnimation();
    }, 6500);

    if (video.readyState >= 2) {
      video.play().catch(() => {});
    } else {
      video.addEventListener('loadeddata', () => video.play().catch(() => {}), { once: true });
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F5F1E8] transition-opacity duration-600 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative max-w-4xl w-full px-4 flex flex-col items-center justify-center">
        {/* Hidden Source Video Element */}
        <video
          ref={videoRef}
          src="/opening-animation.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="hidden"
        />

        {/* Real-Time Canvas Compositor with Radial Mask & Seamless Background Blending */}
        <div 
          className="relative w-full flex items-center justify-center overflow-hidden"
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 60%, transparent 98%)',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 60%, transparent 98%)'
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full max-h-[80vh] object-contain transition-all duration-300"
            style={{
              mixBlendMode: 'multiply',
              filter: 'contrast(135%) brightness(110%) saturate(105%)'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default OpeningAnimation;

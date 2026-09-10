import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Logo } from '../ui/Logo';
import { OpeningAnimation } from '../ui/OpeningAnimation';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(() => {
    // Show animation if not played in current session
    return !sessionStorage.getItem('studypilot_intro_played');
  });

  const handleAnimationComplete = () => {
    sessionStorage.setItem('studypilot_intro_played', 'true');
    setShowAnimation(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F1E8] text-[#172B3A]">
      {/* Opening Video Animation Overlay */}
      {showAnimation && (
        <OpeningAnimation onComplete={handleAnimationComplete} />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#172B3A]/40 backdrop-blur-none transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-[240px] h-full bg-[#F5F1E8]">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-[#172B3A] hover:bg-[#172B3A]/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#172B3A]/15 bg-[#F5F1E8] shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-md text-[#172B3A] hover:bg-[#172B3A]/5"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <div className="w-5" />
        </header>

        {/* Scrollable Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;

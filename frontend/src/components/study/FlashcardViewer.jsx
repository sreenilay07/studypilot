import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export function FlashcardViewer({ flashcards = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, flashcards.length]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-8 text-center border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] text-[#172B3A]/60">
        <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No flashcards available in this study kit.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]">
          FLASHCARDS
        </span>
        <span className="text-xs font-mono font-medium text-[#172B3A]/70 px-2 py-0.5 border border-[#172B3A]/20 rounded">
          {currentIndex + 1} / {flashcards.length}
        </span>
      </div>

      {/* Main Flashcard Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="perspective-1000 cursor-pointer group"
      >
        <div
          className={`w-full min-h-[260px] p-8 rounded-lg border-2 border-[#172B3A] bg-[#F5F1E8] shadow-sm flex flex-col justify-between transition-all duration-300 transform-style-3d ${
            isFlipped ? 'rotate-y-180 bg-[#FAF8F4]' : ''
          }`}
        >
          {/* Card Front (Question) */}
          {!isFlipped ? (
            <div className="flex flex-col justify-between h-full space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#172B3A]/50">
                  Question
                </span>
                <span className="text-xs text-[#172B3A]/50 group-hover:text-[#172B3A]">
                  Click or Space to flip
                </span>
              </div>
              <div className="my-auto py-4">
                <h3 className="text-xl sm:text-2xl font-serif text-[#172B3A] leading-relaxed text-center font-medium">
                  {currentCard?.question}
                </h3>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-[#172B3A]/40 uppercase tracking-wider">
                  Prompt
                </span>
              </div>
            </div>
          ) : (
            /* Card Back (Answer) */
            <div className="flex flex-col justify-between h-full space-y-6 rotate-y-180">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#172B3A]/50">
                  Answer
                </span>
                <span className="text-xs text-[#172B3A]/50">
                  Click or Space to return
                </span>
              </div>
              <div className="my-auto py-4">
                <p className="text-base sm:text-lg text-[#172B3A] leading-relaxed text-center font-normal">
                  {currentCard?.answer}
                </p>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-[#172B3A]/40 uppercase tracking-wider">
                  Core Concept
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        <span className="text-xs text-[#172B3A]/60 font-mono hidden sm:inline-block">
          Use ← Left / Right → keys
        </span>

        <Button
          variant="primary"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default FlashcardViewer;

import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { FlashcardViewer } from './FlashcardViewer';

export function MemoryBoosterView({ session }) {
  const [started, setStarted] = useState(false);
  const flashcards = (session?.flashcards || []).slice(0, 3);
  const questions = (session?.quiz || []).slice(0, 2);

  const timelineDays = [
    { day: 'Today', label: 'Initial Mastery', status: 'Complete' },
    { day: 'Day 3', label: 'Reinforce Synapses', status: 'Scheduled' },
    { day: 'Day 7', label: 'Consolidate Memory', status: 'Scheduled' },
    { day: 'Day 14', label: 'Long-term Retention', status: 'Scheduled' }
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#172B3A]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
            SPACED REPETITION
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] font-display mt-1">
          Tomorrow's Pocket Revision
        </h2>
        <p className="text-sm text-[#172B3A]/70 mt-1">
          Est. time: <span className="font-bold text-[#172B3A]">2 minutes</span> • 3 Flashcards & 2 Questions designed to beat the forgetting curve.
        </p>
      </div>

      {/* Spaced Repetition Schedule Timeline */}
      <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60 font-mono">
          MEMORY RETENTION SCHEDULE
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {timelineDays.map((td, idx) => (
            <div
              key={idx}
              className={`p-3 border rounded-md text-center space-y-1 ${
                td.status === 'Complete'
                  ? 'border-[#172B3A] bg-[#172B3A] text-[#F5F1E8]'
                  : 'border-[#172B3A]/20 bg-[#F5F1E8] text-[#172B3A]'
              }`}
            >
              <div className="text-xs font-mono font-bold uppercase">{td.day}</div>
              <div className="text-[11px] opacity-80">{td.label}</div>
            </div>
          ))}
        </div>
      </div>

      {!started ? (
        <div className="p-8 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] text-center space-y-4">
          <Clock className="w-10 h-10 text-[#172B3A] mx-auto opacity-70" />
          <h3 className="text-xl font-bold font-display text-[#172B3A]">
            Ready for your 2-minute memory booster?
          </h3>
          <p className="text-sm text-[#172B3A]/70 max-w-md mx-auto">
            Reviewing key facts at timed intervals dramatically increases long-term recall efficiency.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="lg" onClick={() => setStarted(true)}>
              Start 2-Minute Revision
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B3A] mb-4">
              Flashcard Review ({flashcards.length} cards)
            </h3>
            <FlashcardViewer flashcards={flashcards} />
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setStarted(false)}>
              Complete Pocket Revision
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoryBoosterView;

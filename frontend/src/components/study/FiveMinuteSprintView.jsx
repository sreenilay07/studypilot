import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export function FiveMinuteSprintView({ session, onComplete }) {
  const [phase, setPhase] = useState(1); // 1: Understand (00:00-01:00), 2: Recall (01:00-03:00), 3: Test (03:00-05:00), 4: Complete
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const weakConcept = (session?.weakTopics && session.weakTopics[0]?.concept) || session?.topic || 'Calvin Cycle';
  const explanation = session?.summary || 'The primary enzymatic reaction sequence fixing carbon dioxide into organic carbohydrates.';
  const flashcards = (session?.flashcards || []).slice(0, 3);
  const questions = (session?.quiz || []).slice(0, 2);

  const handleAnswerSelect = (qIdx, opt) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: opt }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#172B3A]/20 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#172B3A]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]">
              5-MINUTE SPRINT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#172B3A] mt-1">
            Focus Concept: {weakConcept}
          </h2>
        </div>

        {/* Sprint Phase Indicator */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className={`px-2 py-1 border rounded ${phase === 1 ? 'border-[#172B3A] bg-[#172B3A] text-[#F5F1E8] font-bold' : 'border-[#172B3A]/20 opacity-50'}`}>
            00:00–01:00
          </span>
          <span className={`px-2 py-1 border rounded ${phase === 2 ? 'border-[#172B3A] bg-[#172B3A] text-[#F5F1E8] font-bold' : 'border-[#172B3A]/20 opacity-50'}`}>
            01:00–03:00
          </span>
          <span className={`px-2 py-1 border rounded ${phase === 3 ? 'border-[#172B3A] bg-[#172B3A] text-[#F5F1E8] font-bold' : 'border-[#172B3A]/20 opacity-50'}`}>
            03:00–05:00
          </span>
        </div>
      </div>

      {/* PHASE 1: UNDERSTAND (00:00 - 01:00) */}
      {phase === 1 && (
        <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60">
              01 — Understand (1 Minute)
            </span>
            <span className="text-xs font-mono text-[#172B3A]/60">Target: Read & Grasp</span>
          </div>

          <h3 className="text-lg font-serif text-[#172B3A] leading-relaxed">
            {explanation}
          </h3>

          <div className="pt-4 border-t border-[#172B3A]/10 flex justify-end">
            <Button variant="primary" onClick={() => setPhase(2)}>
              Proceed to Recall (Flashcards) <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* PHASE 2: RECALL (01:00 - 03:00) */}
      {phase === 2 && (
        <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60">
              02 — Recall (2 Minutes)
            </span>
            <span className="text-xs font-mono text-[#172B3A]/60">Review {flashcards.length} Flashcards</span>
          </div>

          <div className="space-y-4">
            {flashcards.map((fc, idx) => (
              <div key={idx} className="p-4 border border-[#172B3A]/20 rounded-md bg-[#F5F1E8]">
                <p className="text-xs font-bold uppercase text-[#172B3A]/50 mb-1">
                  Fact {idx + 1}: {fc.question}
                </p>
                <p className="text-sm font-semibold text-[#172B3A]">{fc.answer}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#172B3A]/10 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => setPhase(1)}>
              Back
            </Button>
            <Button variant="primary" onClick={() => setPhase(3)}>
              Proceed to Quick Test <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* PHASE 3: TEST (03:00 - 05:00) */}
      {phase === 3 && (
        <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60">
              03 — Test (2 Minutes)
            </span>
            <span className="text-xs font-mono text-[#172B3A]/60">Target: Answer 2 Questions</span>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-2">
                <p className="text-sm font-bold text-[#172B3A]">
                  Q{qIdx + 1}: {q.question}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {q.options?.map((opt, optIdx) => {
                    const isSel = selectedAnswers[qIdx] === opt;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerSelect(qIdx, opt)}
                        className={`p-3 text-left text-xs font-medium rounded-md border transition-all ${
                          isSel
                            ? 'border-2 border-[#172B3A] bg-[#172B3A] text-[#F5F1E8]'
                            : 'border-[#172B3A]/20 bg-[#F5F1E8] text-[#172B3A] hover:border-[#172B3A]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#172B3A]/10 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => setPhase(2)}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={Object.keys(selectedAnswers).length < questions.length}
              onClick={() => setPhase(4)}
            >
              Complete Sprint
            </Button>
          </div>
        </div>
      )}

      {/* PHASE 4: COMPLETE */}
      {phase === 4 && (
        <div className="p-8 text-center border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[#172B3A] mx-auto" />
          <h3 className="text-2xl font-bold font-display text-[#172B3A]">
            Sprint Revision Complete
          </h3>
          <p className="text-sm text-[#172B3A]/70 max-w-md mx-auto">
            You reviewed the core explanation, recalled 3 key flashcard facts, and completed the targeted check for <span className="font-bold">{weakConcept}</span>.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <Button variant="outline" onClick={() => setPhase(1)}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Repeat Sprint
            </Button>
            <Button variant="primary" onClick={onComplete}>
              Return to Workspace
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FiveMinuteSprintView;

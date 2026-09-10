import React, { useState } from 'react';
import { AlertCircle, HelpCircle, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function CommonTrapsView({ traps = [] }) {
  const [answers, setAnswers] = useState({});

  if (!traps || traps.length === 0) {
    return (
      <div className="p-8 text-center border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] text-[#172B3A]/60">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No exam traps identified for this study kit yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
          EXAM PREPARATION
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] font-display mt-1">
          Common Exam Traps & Confusion Points
        </h2>
        <p className="text-sm text-[#172B3A]/70 mt-1">
          Concepts worth watching closely based on your notes to prevent easy mistakes in exams.
        </p>
      </div>

      {/* Traps List */}
      <div className="space-y-6">
        {traps.map((item, idx) => {
          const selectedIdx = answers[idx];
          const isCorrect = selectedIdx === item.correctIndex;

          return (
            <div key={idx} className="border-2 border-[#172B3A] rounded-md p-6 bg-[#FAF8F4] space-y-4">
              <div className="flex items-center justify-between border-b border-[#172B3A]/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60 font-mono">
                  TRAP #{idx + 1}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 border border-[#172B3A] bg-[#172B3A]/5 text-[#172B3A] rounded-sm">
                  Point of Confusion
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#172B3A] font-display">
                  {item.title}
                </h3>
                <p className="text-xs text-[#172B3A]/70 mt-0.5">{item.context}</p>
              </div>

              <div className="p-4 border-l-4 border-[#172B3A] bg-[#F5F1E8] space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B3A]/60">
                  THE TRAP
                </span>
                <p className="text-sm font-medium text-[#172B3A] leading-relaxed">
                  "{item.trap}"
                </p>
              </div>

              {/* Quick Check Question */}
              {item.checkQuestion && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#172B3A]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]">
                      Quick Check
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#172B3A]">
                    {item.checkQuestion}
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {item.options?.map((opt, optIdx) => {
                      const isSel = selectedIdx === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                          className={`p-3 text-left text-xs font-medium rounded-md border transition-all ${
                            isSel
                              ? optIdx === item.correctIndex
                                ? 'border-2 border-[#172B3A] bg-[#172B3A] text-[#F5F1E8]'
                                : 'border-2 border-[#172B3A] bg-[#172B3A]/10 text-[#172B3A]'
                              : 'border-[#172B3A]/20 bg-[#F5F1E8] text-[#172B3A] hover:border-[#172B3A]'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selectedIdx !== undefined && (
                    <div className="p-3 border border-[#172B3A]/30 rounded bg-[#F5F1E8] text-xs leading-relaxed text-[#172B3A] space-y-1">
                      <span className="font-bold block">
                        {isCorrect ? '✓ Correct Understanding' : 'Explanation'}
                      </span>
                      <p>{item.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CommonTrapsView;

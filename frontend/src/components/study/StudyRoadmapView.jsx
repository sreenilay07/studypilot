import React from 'react';
import { Check, ArrowRight, Circle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export function StudyRoadmapView({ session, roadmapSteps = [] }) {
  const navigate = useNavigate();

  const defaultSteps = [
    { step: '01', title: 'Understand', desc: 'Read your personalized explanation.', status: 'Complete' },
    { step: '02', title: 'Build the picture', desc: 'Explore the Knowledge Map.', status: 'Complete' },
    { step: '03', title: 'Recall', desc: 'Review your flashcards.', status: 'Current' },
    { step: '04', title: 'Test', desc: 'Take the 5-question quiz.', status: 'Upcoming' },
    { step: '05', title: 'Repair', desc: 'Review weak concepts.', status: 'Upcoming' },
    { step: '06', title: 'Retest', desc: 'Prove that you have improved.', status: 'Upcoming' },
    { step: '07', title: 'Remember', desc: 'Complete your memory booster.', status: 'Upcoming' }
  ];

  const steps = roadmapSteps.length > 0 ? roadmapSteps : defaultSteps;
  const topicTitle = session?.topic || 'Photosynthesis';

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
          STUDY ROADMAP
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] font-display mt-1">
          How should I study this?
        </h2>
        <p className="text-sm text-[#172B3A]/70 mt-1">
          StudyPilot turns <span className="font-semibold text-[#172B3A]">{topicTitle}</span> into a structured step-by-step revision path.
        </p>
      </div>

      {/* Step Sequence Timeline */}
      <div className="relative pl-6 space-y-6 border-l-2 border-[#172B3A]/20">
        {steps.map((s, idx) => {
          const isComplete = s.status === 'Complete';
          const isCurrent = s.status === 'Current';

          return (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-[31px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isComplete
                    ? 'bg-[#172B3A] text-[#F5F1E8]'
                    : isCurrent
                    ? 'border-2 border-[#172B3A] bg-[#F5F1E8] text-[#172B3A]'
                    : 'border border-[#172B3A]/30 bg-[#F5F1E8] text-[#172B3A]/40'
                }`}
              >
                {isComplete ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.step}
              </div>

              {/* Content Box */}
              <div
                className={`p-5 rounded-md border transition-all ${
                  isCurrent
                    ? 'border-2 border-[#172B3A] bg-[#FAF8F4]'
                    : 'border-[#172B3A]/15 bg-[#F5F1E8]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#172B3A]/50">
                        {s.step} —
                      </span>
                      <h4 className="text-base font-bold text-[#172B3A] font-display">
                        {s.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#172B3A]/70 mt-1">{s.desc}</p>
                  </div>

                  <div>
                    {isComplete && (
                      <span className="inline-flex items-center text-xs font-semibold text-[#172B3A]">
                        ✓ Complete
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-[#172B3A] bg-[#172B3A] text-[#F5F1E8] rounded-sm">
                        Current Step
                      </span>
                    )}
                    {!isComplete && !isCurrent && (
                      <span className="text-xs text-[#172B3A]/40 font-mono">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudyRoadmapView;

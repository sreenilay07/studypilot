import React, { useState } from 'react';
import { PenTool, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { studyService } from '../../services/api';

export function TeachItBackView({ session }) {
  const concept = session?.topic || 'Calvin Cycle';
  const [explanationText, setExplanationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!explanationText.trim()) return;
    setLoading(true);
    try {
      const res = await studyService.evaluateTeachBack(session?.id || 'demo', explanationText, concept);
      if (res.success) {
        setEvaluation(res.evaluation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEvaluation(null);
    setExplanationText('');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
          ASSESSMENT METHOD
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] font-display mt-1">
          Teach It Back
        </h2>
        <p className="text-sm text-[#172B3A]/70 mt-1">
          The Feynman technique: Explain <span className="font-semibold text-[#172B3A]">{concept}</span> in your own words to prove deep understanding.
        </p>
      </div>

      {!evaluation ? (
        <form onSubmit={handleSubmit} className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A] mb-2">
              Explain this concept in your own words
            </label>
            <textarea
              rows={6}
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              placeholder={`Write your explanation of ${concept} here. Imagine explaining it to a peer...`}
              className="w-full p-4 border border-[#172B3A]/30 rounded-md bg-[#F5F1E8] text-sm text-[#172B3A] focus:outline-none focus:border-[#172B3A] leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#172B3A]/50 font-mono">
              Min ~20 words recommended
            </span>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || explanationText.trim().length < 10}
            >
              {loading ? 'Evaluating Understanding...' : 'Evaluate Explanation'}
            </Button>
          </div>
        </form>
      ) : (
        /* Evaluation Results */
        <div className="space-y-6">
          <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-6">
            <div className="flex items-center justify-between border-b border-[#172B3A]/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
                  YOUR UNDERSTANDING REPORT
                </span>
                <h3 className="text-2xl font-extrabold text-[#172B3A] font-display mt-0.5">
                  {evaluation.score}% Mastery Score
                </h3>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-[#172B3A] flex items-center justify-center font-mono font-bold text-lg text-[#172B3A]">
                {evaluation.score}%
              </div>
            </div>

            <p className="text-sm font-medium text-[#172B3A] leading-relaxed">
              {evaluation.feedback}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Core & Key Points Covered */}
              <div className="p-4 border border-[#172B3A]/20 rounded-md bg-[#F5F1E8] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#172B3A]" /> Key Points Mentioned
                </span>
                <ul className="text-xs text-[#172B3A]/80 space-y-1 list-disc pl-4">
                  {evaluation.keyPointsCovered?.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Missing Details */}
              <div className="p-4 border border-[#172B3A]/20 rounded-md bg-[#F5F1E8] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#172B3A]" /> Missing or Confused
                </span>
                <ul className="text-xs text-[#172B3A]/80 space-y-1 list-disc pl-4">
                  {evaluation.missingConcepts?.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                  {(!evaluation.missingConcepts || evaluation.missingConcepts.length === 0) && (
                    <li>No major gaps identified!</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#172B3A]/10 flex justify-end">
              <Button variant="secondary" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1.5" /> Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachItBackView;

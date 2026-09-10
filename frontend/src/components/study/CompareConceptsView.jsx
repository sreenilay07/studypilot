import React, { useState } from 'react';
import { Columns, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { studyService } from '../../services/api';

export function CompareConceptsView({ session }) {
  const concepts = (session?.knowledgeMap?.nodes || []).map((n) => n.label);
  const defaultA = concepts[0] || 'Mitosis';
  const defaultB = concepts[1] || 'Meiosis';

  const [conceptA, setConceptA] = useState(defaultA);
  const [conceptB, setConceptB] = useState(defaultB);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});

  const handleCompare = async () => {
    if (!conceptA || !conceptB || conceptA === conceptB) return;
    setLoading(true);
    try {
      const res = await studyService.compareConcepts(session?.id || 'demo', conceptA, conceptB);
      if (res.success) {
        setComparison(res.comparison);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
          CONCEPT COMPARISON
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] font-display mt-1">
          Compare Concepts Side-by-Side
        </h2>
        <p className="text-sm text-[#172B3A]/70 mt-1">
          Distinguish key differences, mechanisms, and exam test points between two related concepts.
        </p>
      </div>

      {/* Concept Selectors */}
      <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A] mb-1.5">
              Concept A
            </label>
            <input
              type="text"
              value={conceptA}
              onChange={(e) => setConceptA(e.target.value)}
              className="w-full px-3 py-2 border border-[#172B3A]/30 rounded bg-[#F5F1E8] text-sm text-[#172B3A] focus:outline-none focus:border-[#172B3A]"
              placeholder="e.g. Mitosis"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A] mb-1.5">
              Concept B
            </label>
            <input
              type="text"
              value={conceptB}
              onChange={(e) => setConceptB(e.target.value)}
              className="w-full px-3 py-2 border border-[#172B3A]/30 rounded bg-[#F5F1E8] text-sm text-[#172B3A] focus:outline-none focus:border-[#172B3A]"
              placeholder="e.g. Meiosis"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            onClick={handleCompare}
            disabled={loading || conceptA === conceptB}
          >
            {loading ? 'Generating Comparison...' : 'Compare Concepts'}
          </Button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-8">
          {/* Editorial Comparison Table */}
          <div className="border-2 border-[#172B3A] rounded-md overflow-hidden bg-[#FAF8F4]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#172B3A] text-[#F5F1E8] text-xs font-mono uppercase tracking-wider">
                    <th className="p-4 border-r border-[#F5F1E8]/20 w-1/4">Feature / Property</th>
                    <th className="p-4 border-r border-[#F5F1E8]/20 w-3/8 font-bold">{comparison.conceptA}</th>
                    <th className="p-4 w-3/8 font-bold">{comparison.conceptB}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B3A]/15 text-sm text-[#172B3A]">
                  {comparison.rows?.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#172B3A]/5">
                      <td className="p-4 font-semibold text-xs uppercase tracking-wider text-[#172B3A]/70 border-r border-[#172B3A]/15">
                        {row.attribute}
                      </td>
                      <td className="p-4 border-r border-[#172B3A]/15 leading-relaxed">{row.valA}</td>
                      <td className="p-4 leading-relaxed">{row.valB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Difference Highlight */}
          <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#F5F1E8] space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
              KEY DIFFERENCE
            </span>
            <p className="text-base font-serif text-[#172B3A] leading-relaxed">
              {comparison.keyDifference}
            </p>
          </div>

          {/* Test The Difference */}
          <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-6">
            <div className="flex items-center gap-2 border-b border-[#172B3A]/10 pb-3">
              <HelpCircle className="w-4 h-4 text-[#172B3A]" />
              <h3 className="text-base font-bold text-[#172B3A] font-display">
                Test the Difference
              </h3>
            </div>

            <div className="space-y-6">
              {comparison.questions?.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <p className="text-sm font-semibold text-[#172B3A]">
                    Q{qIdx + 1}: {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options?.map((opt, optIdx) => {
                      const isSel = quizAnswers[qIdx] === opt;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: opt }))}
                          className={`p-3 text-left text-xs font-medium rounded-md border transition-all ${
                            isSel
                              ? opt === q.answer
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareConceptsView;

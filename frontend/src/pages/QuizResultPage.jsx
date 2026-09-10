import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studyService } from '../services/api';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Clock, BookOpen } from 'lucide-react';

export function QuizResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        const res = await studyService.getSession(id);
        const sess = res.data?.session || res.data;
        if (sess) {
          setSession(sess);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <BookOpen className="w-8 h-8 text-[#172B3A] mx-auto animate-pulse" />
        <p className="text-xs font-mono text-[#172B3A]/70">Generating learning report...</p>
      </div>
    );
  }

  const result = session?.quizResult || { score: 3, total: 5, percentage: 60 };
  const weakTopics = session?.weakTopics || [
    { concept: 'Calvin Cycle', status: 'Weak' },
    { concept: 'Light Reactions', status: 'Needs Revision' }
  ];

  const strongTopics = (session?.keyPoints || ['Definition', 'Basic Equation']).slice(0, 2);

  const weakestItem = weakTopics.find((t) => t.status === 'Weak') || weakTopics[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#172B3A]/20 pb-6 text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60 font-mono">
          EVALUATION REPORT
        </span>
        <h1 className="text-3xl font-extrabold text-[#172B3A] font-display">
          YOUR LEARNING REPORT
        </h1>
        <p className="text-sm text-[#172B3A]/70">{session?.topic}</p>
      </div>

      {/* Score Summary Box */}
      <div className="p-8 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60">
            Exam Performance
          </span>
          <div className="text-4xl font-extrabold font-mono text-[#172B3A] mt-1">
            {result.score || 0} / {result.total || 5}
          </div>
          <p className="text-xs text-[#172B3A]/70 mt-1">
            Overall accuracy: <span className="font-bold">{result.percentage || 0}%</span>
          </p>
        </div>

        <div className="text-right flex gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(`/study/${id}/quiz`)}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retest
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(`/study/${id}`)}>
            Return to Kit
          </Button>
        </div>
      </div>

      {/* Breakdown: WHAT YOU KNOW vs WHAT NEEDS ATTENTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* WHAT YOU KNOW */}
        <div className="p-6 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-1.5 font-display">
            <CheckCircle2 className="w-4 h-4 text-[#172B3A]" /> WHAT YOU KNOW
          </span>

          <div className="space-y-2">
            {strongTopics.map((item, idx) => (
              <div key={idx} className="p-3 border border-[#172B3A]/15 rounded bg-[#F5F1E8] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#172B3A]">{typeof item === 'string' ? item : item.concept}</span>
                <StatusBadge status="Strong" />
              </div>
            ))}
          </div>
        </div>

        {/* WHAT NEEDS ATTENTION */}
        <div className="p-6 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-1.5 font-display">
            <AlertTriangle className="w-4 h-4 text-[#172B3A]" /> WHAT NEEDS ATTENTION
          </span>

          <div className="space-y-2">
            {weakTopics.map((item, idx) => (
              <div key={idx} className="p-3 border border-[#172B3A]/15 rounded bg-[#F5F1E8] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#172B3A]">{item.concept}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* YOUR NEXT BEST ACTION */}
      {weakestItem && (
        <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#F5F1E8] space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#172B3A]" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#172B3A]">
              YOUR NEXT BEST ACTION
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-display text-[#172B3A]">
                {weakestItem.concept}
              </h3>
              <p className="text-xs text-[#172B3A]/80 mt-1">
                You missed questions related to this concept during the quiz.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#172B3A]/60 mt-1">
                <Clock className="w-3.5 h-3.5" /> Estimated time: 5 minutes
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/study/${id}/revision`)}
            >
              Start Targeted Revision <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizResultPage;

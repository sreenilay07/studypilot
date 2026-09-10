import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../services/api';
import { Button } from '../components/ui/Button';
import { BookOpen, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

export function MistakesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await studyService.getSession(id);
        const sess = res.data?.session || res.data;
        if (sess) setSession(sess);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <BookOpen className="w-8 h-8 text-[#172B3A] mx-auto animate-pulse" />
        <p className="text-xs font-mono text-[#172B3A]/70">Analyzing conceptual misunderstandings...</p>
      </div>
    );
  }

  const topic = session?.topic || 'Photosynthesis';
  const quizObj = session?.quiz?.[0] || {
    question: 'Where does the Calvin cycle take place?',
    options: ['Thylakoid Membrane', 'Stroma', 'Mitochondria', 'Cytoplasm'],
    answer: 'Stroma',
    explanation: 'The Calvin cycle reactions occur in the stroma fluid of the chloroplast.'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#172B3A]/20 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60 font-mono">
          LEARNING BREAKDOWN
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] font-display mt-0.5">
          Explain My Mistake
        </h1>
        <p className="text-sm text-[#172B3A]/70 mt-0.5">
          Understanding the conceptual gap behind incorrect answers.
        </p>
      </div>

      {/* The Question Box */}
      <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60 font-mono">
          THE QUESTION
        </span>
        <h3 className="text-lg font-serif font-medium text-[#172B3A] leading-relaxed">
          {quizObj.question}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 border border-[#172B3A]/30 rounded bg-[#F5F1E8] text-xs">
            <span className="font-bold text-[#172B3A]/60 block uppercase">Your Answer</span>
            <span className="font-semibold text-[#172B3A] text-sm mt-0.5 block">
              {quizObj.options?.[0] || 'Thylakoid Membrane'}
            </span>
          </div>

          <div className="p-3 border-2 border-[#172B3A] rounded bg-[#F5F1E8] text-xs">
            <span className="font-bold text-[#172B3A] block uppercase">Correct Answer</span>
            <span className="font-bold text-[#172B3A] text-sm mt-0.5 block">
              {quizObj.answer}
            </span>
          </div>
        </div>
      </div>

      {/* WHY THIS HAPPENED */}
      <div className="p-6 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] font-display">
          WHY THIS HAPPENED
        </span>
        <p className="text-sm text-[#172B3A] leading-relaxed">
          Students often confuse spatial localization between light-dependent reactions (which require thylakoid membranes) and light-independent carbon fixation reactions (which occur in the fluid stroma).
        </p>
      </div>

      {/* REMEMBER & MEMORY HOOK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border border-[#172B3A]/20 rounded-md bg-[#F5F1E8] space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]">
            REMEMBER
          </span>
          <p className="text-xs text-[#172B3A]/90 leading-relaxed font-medium">
            Stroma is the fluid filling surrounding thylakoids, hosting enzymatic carbon assembly.
          </p>
        </div>

        <div className="p-4 border border-[#172B3A]/20 rounded-md bg-[#F5F1E8] space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]">
            MEMORY HOOK
          </span>
          <p className="text-xs text-[#172B3A]/90 leading-relaxed font-medium">
            <span className="font-bold">S</span>troma = <span className="font-bold">S</span>ugar synthesis fluid.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="pt-2 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => navigate(`/study/${id}`)}>
          Back to Kit
        </Button>
        <Button variant="primary" size="md" onClick={() => navigate(`/study/${id}/quiz`)}>
          Try a Similar Question <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

export default MistakesPage;

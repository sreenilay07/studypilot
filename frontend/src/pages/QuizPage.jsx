import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Check, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

export function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const res = await studyService.getSession(id);
        const sess = res.data?.session || res.data;
        if (sess) {
          setSession(sess);
          setAnswers(new Array(sess.quiz?.length || 0).fill(''));
        } else {
          setError('Quiz not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load examination quiz');
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [id]);

  const handleSelectOption = (opt) => {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = opt;
    setAnswers(nextAnswers);
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const payloadAnswers = answers.map((selected, idx) => ({
        questionIndex: idx,
        selectedAnswer: selected || ''
      }));

      await studyService.analyzeQuiz(id, payloadAnswers);
      navigate(`/study/${id}/result`);
    } catch (err) {
      console.error(err);
      // Navigate anyway so user sees results
      navigate(`/study/${id}/result`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3 max-w-lg mx-auto">
        <BookOpen className="w-8 h-8 text-[#172B3A] mx-auto animate-pulse" />
        <p className="text-xs font-mono text-[#172B3A]/70">Loading examination paper...</p>
      </div>
    );
  }

  if (error || !session?.quiz || session.quiz.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4 max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-[#172B3A] mx-auto" />
        <h3 className="text-lg font-bold font-display text-[#172B3A]">No Quiz Available</h3>
        <Button variant="primary" size="sm" onClick={() => navigate(`/study/${id}`)}>
          Back to Workspace
        </Button>
      </div>
    );
  }

  const currentQ = session.quiz[currentIndex];
  const isLast = currentIndex === session.quiz.length - 1;
  const answeredCount = answers.filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Quiz Progress Top Bar */}
      <div className="border-b border-[#172B3A]/20 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60 font-mono">
            EXAMINATION QUIZ
          </span>
          <h2 className="text-xl font-bold font-display text-[#172B3A] mt-0.5">
            {session.topic}
          </h2>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs font-mono font-bold text-[#172B3A]">
            Question {currentIndex + 1} of {session.quiz.length}
          </span>
          
          {/* Question Navigation Pills */}
          <div className="flex items-center gap-1">
            {session.quiz.map((_, idx) => {
              const isAnswered = Boolean(answers[idx]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-6 h-6 rounded text-[11px] font-mono font-bold border transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'border-2 border-[#172B3A] bg-[#172B3A] text-[#F5F1E8]'
                      : isAnswered
                      ? 'border-[#172B3A]/40 bg-[#172B3A]/15 text-[#172B3A]'
                      : 'border-[#172B3A]/20 bg-[#FAF8F4] text-[#172B3A]/40 hover:border-[#172B3A]'
                  }`}
                  title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question Box */}
      <div className="p-8 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-6">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#172B3A]/50">
          Question {currentIndex + 1}
        </span>

        <h3 className="text-lg sm:text-xl font-serif font-medium text-[#172B3A] leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQ.options?.map((opt, idx) => {
            const isSelected = answers[currentIndex] === opt;
            const letter = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className={`w-full p-4 text-left rounded-md border-2 transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-[#172B3A] bg-[#172B3A] text-[#F5F1E8] font-medium'
                    : 'border-[#172B3A]/20 bg-[#F5F1E8] text-[#172B3A] hover:border-[#172B3A]'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border border-[#F5F1E8] bg-[#F5F1E8] text-[#172B3A]'
                      : 'border border-[#172B3A]/30 bg-[#FAF8F4] text-[#172B3A]'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-sm leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiz Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#172B3A]/60">
            {answeredCount} of {session.quiz.length} answered
          </span>
        </div>

        {!isLast ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, session.quiz.length - 1))}
          >
            Next Question
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmitQuiz}
            disabled={submitting}
          >
            {submitting ? 'Analyzing Submission...' : 'Submit Examination'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default QuizPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyService } from '../services/api';
import { Button } from '../components/ui/Button';
import { FileUploadZone } from '../components/ui/FileUploadZone';
import { BookOpen, Check, ArrowRight, AlertCircle, FileText, Upload } from 'lucide-react';

export function CreateStudyKit() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [learningStyle, setLearningStyle] = useState('Simple Explanation');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);

  const teachingStyles = [
    {
      id: 'Simple Explanation',
      label: 'Simple Explanation',
      desc: 'Clear language without unnecessary terminology. Focuses on core intuition.'
    },
    {
      id: 'Exam Focused',
      label: 'Exam Focused',
      desc: 'Important definitions, key facts, and likely examination test points.'
    },
    {
      id: 'Professor',
      label: 'Teach Me Like a Professor',
      desc: 'Deep conceptual reasoning, systemic relationships, and theoretical rigor.'
    }
  ];

  const loadingMessages = [
    'Preparing your study kit...',
    'Reading your notes...',
    'Finding important concepts...',
    'Building your revision material...',
    'Preparing your quiz questions...'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic name.');
      return;
    }
    if (!notes.trim() || notes.trim().length < 20) {
      setError('Please enter notes with at least 20 characters.');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep(0);

    // Step-by-step progress simulation during generation
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      // 1. Generate study kit via backend AI
      const genRes = await studyService.generateKit({
        topic: topic.trim(),
        notes: notes.trim(),
        difficulty,
        learningStyle
      });

      const kitData = genRes.data?.data || genRes.data;

      // 2. Save created session to DB
      const saveRes = await studyService.saveSession({
        topic: topic.trim(),
        notes: notes.trim(),
        difficulty,
        learningStyle,
        summary: kitData.summary || '',
        keyPoints: kitData.keyPoints || [],
        flashcards: kitData.flashcards || [],
        knowledgeMap: kitData.knowledgeMap || { nodes: [], edges: [] },
        quiz: kitData.quiz || []
      });

      clearInterval(interval);
      const sessionId = saveRes.data?.session?.id || saveRes.data?.session?._id;
      if (sessionId) {
        navigate(`/study/${sessionId}`);
      } else {
        navigate('/history');
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setError(err.message || "StudyPilot couldn't create your study kit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
          STUDYKIT BUILDER
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] font-display mt-1">
          Create Study Kit
        </h1>
        <p className="text-sm text-[#172B3A]/70 mt-1">
          Drag and drop study documents or paste your lecture notes and textbook excerpts to build your revision kit.
        </p>
      </div>

      {error && (
        <div className="p-4 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] flex items-start gap-3 text-sm text-[#172B3A]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Creation Error</span>
            <p className="text-xs text-[#172B3A]/80">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        /* SKELETON LOADER STATE */
        <div className="p-10 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] text-center space-y-6">
          <BookOpen className="w-10 h-10 text-[#172B3A] mx-auto animate-pulse" />
          <div>
            <h3 className="text-xl font-bold font-display text-[#172B3A]">
              Building your study kit
            </h3>
            <p className="text-xs font-mono text-[#172B3A]/70 mt-1">
              {loadingMessages[loadingStep]}
            </p>
          </div>

          {/* Progress sequence list */}
          <div className="max-w-md mx-auto space-y-2 text-left pt-2">
            {loadingMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs p-2 rounded border transition-all ${
                  idx < loadingStep
                    ? 'border-[#172B3A] bg-[#172B3A] text-[#F5F1E8] font-medium'
                    : idx === loadingStep
                    ? 'border-[#172B3A] bg-[#F5F1E8] text-[#172B3A] font-bold'
                    : 'border-[#172B3A]/15 text-[#172B3A]/40'
                }`}
              >
                <span className="w-4 text-center font-mono font-bold">
                  {idx < loadingStep ? '✓' : idx + 1}
                </span>
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* EDITORIAL INPUT FORM */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A]">
              Topic Title
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis & Calvin Cycle"
              className="w-full px-4 py-3 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] text-base text-[#172B3A] focus:outline-none focus:bg-[#F5F1E8]"
            />
          </div>

          {/* DRAG AND DROP FILE UPLOAD AREA */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Upload Files (Drag & Drop)
              </label>
              <span className="text-xs font-mono text-[#172B3A]/60">
                Supports TXT, MD, PDF, DOCX, Code
              </span>
            </div>
            <FileUploadZone
              onFilesExtracted={(extractedText) => {
                if (extractedText) {
                  setNotes(extractedText);
                }
              }}
              onTopicSuggested={(suggestedTitle) => {
                if (!topic.trim()) {
                  setTopic(suggestedTitle);
                }
              }}
            />
          </div>

          {/* Notes Textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A]">
                Class Notes / Extracted Text
              </label>
              <span className="text-xs font-mono text-[#172B3A]/60">
                Min 20 characters
              </span>
            </div>
            <textarea
              rows={8}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extracted file text will appear here. Or paste your class notes, lecture summaries, or textbook paragraphs..."
              className="w-full p-4 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] text-sm text-[#172B3A] leading-relaxed focus:outline-none focus:bg-[#F5F1E8] resize-y"
            />
          </div>

          {/* Teaching Style Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A]">
              HOW SHOULD I TEACH THIS?
            </label>

            <div className="grid grid-cols-1 gap-3">
              {teachingStyles.map((style) => {
                const isSelected = learningStyle === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setLearningStyle(style.id)}
                    className={`p-4 rounded-md border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#172B3A] bg-[#172B3A] text-[#F5F1E8]'
                        : 'border-[#172B3A]/20 bg-[#FAF8F4] text-[#172B3A] hover:border-[#172B3A]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold font-display">{style.label}</h4>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'opacity-90' : 'text-[#172B3A]/70'}`}>
                      {style.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty Level Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A]">
              Target Academic Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'University Level'].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border transition-all ${
                    difficulty === level
                      ? 'border-2 border-[#172B3A] bg-[#172B3A] text-[#F5F1E8]'
                      : 'border-[#172B3A]/20 bg-[#FAF8F4] text-[#172B3A] hover:border-[#172B3A]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#172B3A]/15 flex justify-end">
            <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
              Build my study kit <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateStudyKit;

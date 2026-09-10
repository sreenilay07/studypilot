import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { studyService } from '../services/api';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { KnowledgeMap } from '../components/study/KnowledgeMap';
import { FlashcardViewer } from '../components/study/FlashcardViewer';
import { StudyRoadmapView } from '../components/study/StudyRoadmapView';
import { FiveMinuteSprintView } from '../components/study/FiveMinuteSprintView';
import { CommonTrapsView } from '../components/study/CommonTrapsView';
import { CompareConceptsView } from '../components/study/CompareConceptsView';
import { TeachItBackView } from '../components/study/TeachItBackView';
import { SocraticMentorView } from '../components/study/SocraticMentorView';
import { MemoryBoosterView } from '../components/study/MemoryBoosterView';

import {
  BookOpen,
  FileText,
  Layers,
  Map,
  HelpCircle,
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  PenTool,
  MessageCircle,
  Calendar,
  Columns
} from 'lucide-react';

export function StudySessionDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [traps, setTraps] = useState([]);
  const [roadmap, setRoadmap] = useState([]);

  // Active Tab State (sync with URL search params)
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    async function fetchSessionData() {
      try {
        setLoading(true);
        const res = await studyService.getSession(id);
        if (res.data?.success && res.data?.session) {
          setSession(res.data.session);
        } else if (res.data?.topic) {
          setSession(res.data);
        } else {
          setError('Study session not found.');
        }

        // Fetch traps & roadmap in parallel
        const [trapsRes, roadmapRes] = await Promise.allSettled([
          studyService.getCommonTraps(id),
          studyService.getRoadmap(id)
        ]);

        if (trapsRes.status === 'fulfilled' && trapsRes.value?.traps) {
          setTraps(trapsRes.value.traps);
        }
        if (roadmapRes.status === 'fulfilled' && roadmapRes.value?.roadmap) {
          setRoadmap(roadmapRes.value.roadmap);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load this study session.");
      } finally {
        setLoading(false);
      }
    }
    fetchSessionData();
  }, [id]);

  const setTab = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <BookOpen className="w-8 h-8 text-[#172B3A] mx-auto animate-pulse" />
        <p className="text-sm font-mono text-[#172B3A]/70">Loading Study Kit workspace...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-8 text-center border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4 max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-[#172B3A] mx-auto" />
        <h3 className="text-xl font-bold font-display text-[#172B3A]">Session Not Found</h3>
        <p className="text-xs text-[#172B3A]/70">{error || 'This study kit does not exist or has been deleted.'}</p>
        <Link to="/">
          <Button variant="primary" size="sm">Return to Workspace</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'summary', label: '60-Sec Summary' },
    { key: 'concepts', label: 'Concepts' },
    { key: 'map', label: 'Knowledge Map' },
    { key: 'flashcards', label: 'Flashcards' },
    { key: 'quiz', label: 'Quiz' },
    { key: 'weakness', label: 'Find Weakness' },
    { key: 'roadmap', label: 'Roadmap' },
    { key: 'traps', label: 'Common Traps' },
    { key: 'compare', label: 'Compare' },
    { key: 'sprint', label: '5-Min Sprint' },
    { key: 'teachback', label: 'Teach It Back' },
    { key: 'mentor', label: 'Mentor' },
    { key: 'booster', label: 'Memory Booster' },
  ];

  return (
    <div className="space-y-8">
      {/* Workspace Top Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#172B3A]/60">
                STUDY KIT WORKSPACE
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 border border-[#172B3A]/30 rounded bg-[#172B3A]/5">
                {session.learningStyle || 'Simple Explanation'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 border border-[#172B3A]/30 rounded bg-[#172B3A]/5">
                {session.difficulty || 'Intermediate'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172B3A] font-display">
              {session.topic}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/study/${id}/quiz`)}>
              Take Quiz
            </Button>
            <Button variant="primary" size="sm" onClick={() => setTab('sprint')}>
              <Clock className="w-3.5 h-3.5 mr-1.5" /> 5-Min Sprint
            </Button>
          </div>
        </div>

        {/* Tab Strip Navigation Bar */}
        <div className="flex items-center gap-1 mt-6 border-b border-[#172B3A]/20 overflow-x-auto pb-0.5 text-xs font-medium font-display">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#172B3A] text-[#172B3A] bg-[#172B3A]/5'
                    : 'border-transparent text-[#172B3A]/70 hover:text-[#172B3A] hover:bg-[#172B3A]/5'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT VIEWS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 max-w-4xl">
          {/* Quick Summary Banner */}
          <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60 font-mono">
              EXECUTIVE SUMMARY
            </span>
            <p className="text-base sm:text-lg font-serif text-[#172B3A] leading-relaxed">
              {session.summary}
            </p>
          </div>

          {/* Key Points Checklist */}
          {session.keyPoints && session.keyPoints.length > 0 && (
            <div className="p-6 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B3A] font-display">
                Key Concepts & Core Principles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {session.keyPoints.map((kp, idx) => (
                  <div key={idx} className="p-3 border border-[#172B3A]/15 rounded-md bg-[#F5F1E8] flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#172B3A]/50 mt-0.5">0{idx + 1}</span>
                    <p className="text-xs font-medium text-[#172B3A] leading-normal">{kp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workspace Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setTab('summary')}
              className="p-5 border border-[#172B3A]/30 rounded-md bg-[#F5F1E8] hover:border-[#172B3A] cursor-pointer transition-all space-y-2"
            >
              <FileText className="w-5 h-5 text-[#172B3A]" />
              <h4 className="text-sm font-bold font-display text-[#172B3A]">60-Second Revision</h4>
              <p className="text-xs text-[#172B3A]/70">Read the high-yield summary breakdown.</p>
            </div>

            <div
              onClick={() => setTab('map')}
              className="p-5 border border-[#172B3A]/30 rounded-md bg-[#F5F1E8] hover:border-[#172B3A] cursor-pointer transition-all space-y-2"
            >
              <Map className="w-5 h-5 text-[#172B3A]" />
              <h4 className="text-sm font-bold font-display text-[#172B3A]">Knowledge Map</h4>
              <p className="text-xs text-[#172B3A]/70">See the big picture structural relationships.</p>
            </div>

            <div
              onClick={() => navigate(`/study/${id}/quiz`)}
              className="p-5 border border-[#172B3A]/30 rounded-md bg-[#F5F1E8] hover:border-[#172B3A] cursor-pointer transition-all space-y-2"
            >
              <HelpCircle className="w-5 h-5 text-[#172B3A]" />
              <h4 className="text-sm font-bold font-display text-[#172B3A]">Test Yourself</h4>
              <p className="text-xs text-[#172B3A]/70">Take the 5-question examination quiz.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 60-SECOND SUMMARY TAB */}
      {activeTab === 'summary' && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-8 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-6">
            <div className="flex items-center justify-between border-b border-[#172B3A]/15 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
                  60 SECOND REVISION
                </span>
                <h2 className="text-xl font-bold font-display text-[#172B3A] mt-0.5">
                  High-Yield Concept Breakdown
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 border border-[#172B3A] bg-[#172B3A]/5 text-[#172B3A] rounded">
                Est. time: 1 minute
              </span>
            </div>

            <div className="space-y-4 text-base font-serif text-[#172B3A] leading-relaxed">
              <p>{session.summary}</p>
            </div>

            <div className="pt-4 border-t border-[#172B3A]/15 flex justify-end">
              <Button variant="primary" onClick={() => setTab('flashcards')}>
                Start Flashcard Recall <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONCEPTS TAB */}
      {activeTab === 'concepts' && (
        <div className="space-y-4 max-w-3xl">
          <div className="border-b border-[#172B3A]/15 pb-4">
            <h2 className="text-xl font-bold font-display text-[#172B3A]">
              Concept Inventory & Mastery
            </h2>
            <p className="text-xs text-[#172B3A]/70">Individual concepts identified in your notes.</p>
          </div>

          <div className="space-y-3">
            {(session.knowledgeMap?.nodes || []).map((node, idx) => {
              const weakMatch = (session.weakTopics || []).find(
                (w) => w.concept && w.concept.toLowerCase().includes(node.label.toLowerCase())
              );
              const status = weakMatch ? weakMatch.status : 'Strong';

              return (
                <div key={idx} className="p-4 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#172B3A] font-display">{node.label}</h4>
                    <p className="text-xs text-[#172B3A]/70 mt-0.5">Primary concept node in {session.topic}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={status} />
                    <Button variant="outline" size="sm" onClick={() => setTab('compare')}>
                      Compare
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. KNOWLEDGE MAP TAB */}
      {activeTab === 'map' && (
        <KnowledgeMap
          knowledgeMap={session.knowledgeMap}
          weakTopics={session.weakTopics}
          onSelectConcept={(conceptName) => setTab('compare')}
        />
      )}

      {/* 5. FLASHCARDS TAB */}
      {activeTab === 'flashcards' && (
        <FlashcardViewer flashcards={session.flashcards} />
      )}

      {/* 6. QUIZ TAB */}
      {activeTab === 'quiz' && (
        <div className="p-8 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] text-center space-y-4 max-w-lg mx-auto">
          <HelpCircle className="w-10 h-10 text-[#172B3A] mx-auto" />
          <h3 className="text-xl font-bold font-display text-[#172B3A]">
            Ready to test yourself on {session.topic}?
          </h3>
          <p className="text-xs text-[#172B3A]/70">
            5 questions designed to evaluate conceptual understanding, definitions, and mechanisms.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate(`/study/${id}/quiz`)}>
            Start Quiz Now
          </Button>
        </div>
      )}

      {/* 7. FIND MY WEAKNESS TAB */}
      {activeTab === 'weakness' && (
        <div className="space-y-6 max-w-3xl">
          <div className="border-b border-[#172B3A]/15 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
              WEAKNESS ANALYSIS
            </span>
            <h2 className="text-2xl font-bold font-display text-[#172B3A] mt-0.5">
              Find My Weakness
            </h2>
            <p className="text-xs text-[#172B3A]/70 mt-0.5">
              "Don't revise everything. Fix what matters."
            </p>
          </div>

          <div className="border border-[#172B3A]/20 rounded-md overflow-hidden bg-[#FAF8F4]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#172B3A]/15 text-xs font-mono uppercase bg-[#172B3A]/5 text-[#172B3A]/70">
                  <th className="p-3.5">Concept</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B3A]/10 text-[#172B3A]">
                {(session.weakTopics && session.weakTopics.length > 0
                  ? session.weakTopics
                  : [{ concept: session.topic, status: 'Needs Revision' }]
                ).map((wt, idx) => (
                  <tr key={idx} className="hover:bg-[#172B3A]/5">
                    <td className="p-3.5 font-bold font-display">{wt.concept}</td>
                    <td className="p-3.5">
                      <StatusBadge status={wt.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/study/${id}/revision`)}
                      >
                        Revise Concept
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. ROADMAP TAB */}
      {activeTab === 'roadmap' && (
        <StudyRoadmapView session={session} roadmapSteps={roadmap} />
      )}

      {/* 9. COMMON TRAPS TAB */}
      {activeTab === 'traps' && (
        <CommonTrapsView traps={traps} />
      )}

      {/* 10. COMPARE TAB */}
      {activeTab === 'compare' && (
        <CompareConceptsView session={session} />
      )}

      {/* 11. 5-MIN SPRINT TAB */}
      {activeTab === 'sprint' && (
        <FiveMinuteSprintView session={session} onComplete={() => setTab('overview')} />
      )}

      {/* 12. TEACH IT BACK TAB */}
      {activeTab === 'teachback' && (
        <TeachItBackView session={session} />
      )}

      {/* 13. MENTOR TAB */}
      {activeTab === 'mentor' && (
        <SocraticMentorView session={session} />
      )}

      {/* 14. MEMORY BOOSTER TAB */}
      {activeTab === 'booster' && (
        <MemoryBoosterView session={session} />
      )}
    </div>
  );
}

export default StudySessionDetail;

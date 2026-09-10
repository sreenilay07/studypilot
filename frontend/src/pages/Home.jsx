import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  PlusSquare,
  ArrowRight,
  Clock,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [nextAction, setNextAction] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [histRes, actionRes] = await Promise.allSettled([
          studyService.getHistory(),
          studyService.getNextBestAction()
        ]);

        if (histRes.status === 'fulfilled' && histRes.value?.data?.sessions) {
          setSessions(histRes.value.data.sessions);
        }
        if (actionRes.status === 'fulfilled' && actionRes.value?.action) {
          setNextAction(actionRes.value.action);
        }
      } catch (err) {
        console.error('Error fetching home workspace data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const roadmapSteps = [
    { num: '1', title: 'Understand', current: true },
    { num: '2', title: 'Practice', current: false },
    { num: '3', title: 'Identify gaps', current: false },
    { num: '4', title: 'Repair', current: false },
    { num: '5', title: 'Retest', current: false },
    { num: '6', title: 'Remember', current: false },
  ];

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Top Welcome Desk Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#172B3A]/15 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60">
            STUDYPILOT WORKSPACE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172B3A] font-display mt-1">
            Good morning{user?.name ? `, ${user.name}` : ''}.
          </h1>
          <p className="text-lg text-[#172B3A]/80 mt-1 font-serif">
            What are you studying today?
          </p>
        </div>

        <Link to="/create">
          <Button variant="primary" size="lg">
            <PlusSquare className="w-4 h-4 mr-2" /> Create Study Kit
          </Button>
        </Link>
      </div>

      {/* SECTION 1: YOUR NEXT BEST ACTION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#172B3A]" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#172B3A]">
            YOUR NEXT BEST ACTION
          </h2>
        </div>

        <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] flex flex-wrap items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-display text-[#172B3A]">
                {nextAction?.title || 'Calvin Cycle'}
              </h3>
              <StatusBadge status="Needs Revision" />
            </div>
            <p className="text-sm text-[#172B3A]/80 leading-relaxed">
              {nextAction?.reason || 'You missed 2 questions related to this concept during your last test session.'}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#172B3A]/60 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Estimated time: {nextAction?.estimatedMinutes || 5} minutes
              </span>
            </div>
          </div>

          <div>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (nextAction?.targetUrl) {
                  navigate(nextAction.targetUrl);
                } else if (sessions.length > 0) {
                  navigate(`/study/${sessions[0].id}`);
                } else {
                  navigate('/create');
                }
              }}
            >
              Start Revision <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* QUICK ACTION: I ONLY HAVE 5 MINUTES */}
      <div className="p-5 border border-[#172B3A]/20 rounded-md bg-[#F5F1E8] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B3A]/60 font-mono">
            QUICK REVISION SPRINT
          </span>
          <h3 className="text-base font-bold text-[#172B3A] font-display mt-0.5">
            I only have 5 minutes
          </h3>
          <p className="text-xs text-[#172B3A]/70">
            Run a targeted 3-stage sprint (Understand, Recall, Test) on your weakest concept right now.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (sessions.length > 0) {
              navigate(`/study/${sessions[0].id}?tab=sprint`);
            } else {
              navigate('/create');
            }
          }}
        >
          <Clock className="w-3.5 h-3.5 mr-1.5" /> Start 5-Minute Study
        </Button>
      </div>

      {/* SECTION 2: HOW SHOULD YOU STUDY? */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#172B3A]">
          HOW SHOULD YOU STUDY?
        </h2>

        <div className="p-6 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] space-y-4">
          <p className="text-xs text-[#172B3A]/70">
            StudyPilot active learning roadmap for optimal retention:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {roadmapSteps.map((step) => (
              <div
                key={step.num}
                className={`p-3 rounded border text-center transition-all ${
                  step.current
                    ? 'border-2 border-[#172B3A] bg-[#172B3A] text-[#F5F1E8]'
                    : 'border-[#172B3A]/20 bg-[#F5F1E8] text-[#172B3A]'
                }`}
              >
                <div className="font-mono text-[11px] font-bold uppercase opacity-75">
                  Step {step.num}
                </div>
                <div className="text-xs font-bold font-display mt-0.5">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: RECENT STUDY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#172B3A]">
            RECENT STUDY
          </h2>
          {sessions.length > 0 && (
            <Link to="/history" className="text-xs font-semibold text-[#172B3A] hover:underline">
              View all history →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center border border-[#172B3A]/15 rounded-md bg-[#FAF8F4] text-xs text-[#172B3A]/60">
            Loading recent study kits...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-[#172B3A]/30 rounded-md bg-[#FAF8F4] space-y-3">
            <BookOpen className="w-8 h-8 text-[#172B3A] mx-auto opacity-50" />
            <h3 className="text-base font-bold text-[#172B3A] font-display">
              Ready to study?
            </h3>
            <p className="text-xs text-[#172B3A]/70 max-w-sm mx-auto">
              Give StudyPilot your notes and we'll build your first personalized revision kit.
            </p>
            <Link to="/create">
              <Button variant="primary" size="sm">
                Create First Study Kit
              </Button>
            </Link>
          </div>
        ) : (
          <div className="border border-[#172B3A]/20 rounded-md overflow-hidden bg-[#FAF8F4]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#172B3A]/15 text-xs font-mono uppercase text-[#172B3A]/70 bg-[#172B3A]/5">
                    <th className="p-3.5">Topic</th>
                    <th className="p-3.5">Learning Style</th>
                    <th className="p-3.5">Quiz Score</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B3A]/10 text-[#172B3A]">
                  {sessions.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-[#172B3A]/5 transition-colors">
                      <td className="p-3.5 font-bold font-display">{s.topic}</td>
                      <td className="p-3.5 text-xs text-[#172B3A]/70">{s.learningStyle || 'Simple Explanation'}</td>
                      <td className="p-3.5 font-mono text-xs font-semibold">
                        {typeof s.score === 'number' ? `${s.score}%` : 'Unchecked'}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge
                          status={
                            typeof s.score === 'number'
                              ? s.score >= 80
                                ? 'Strong'
                                : 'Needs Revision'
                              : 'Needs Revision'
                          }
                        />
                      </td>
                      <td className="p-3.5 text-right">
                        <Link to={`/study/${s.id}`}>
                          <Button variant="outline" size="sm">
                            Open Kit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studyService } from '../services/api';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BarChart2, BookOpen, Clock, Target, CheckCircle2 } from 'lucide-react';

export function ProgressPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await studyService.getHistory();
        if (res.data?.sessions) {
          setSessions(res.data.sessions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalTopics = sessions.length;
  const scoredSessions = sessions.filter((s) => typeof s.score === 'number');
  const avgScore = scoredSessions.length
    ? Math.round(scoredSessions.reduce((acc, curr) => acc + curr.score, 0) / scoredSessions.length)
    : 0;

  const masteredCount = scoredSessions.filter((s) => s.score >= 80).length;
  const revisionCount = totalTopics - masteredCount;
  const estimatedTimeMins = totalTopics * 12;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60 font-mono">
          ACADEMIC ANALYTICS
        </span>
        <h1 className="text-3xl font-extrabold text-[#172B3A] font-display mt-0.5">
          Learning Progress
        </h1>
        <p className="text-sm text-[#172B3A]/70 mt-0.5">
          Clear metric indicators tracking topic mastery, revision efficiency, and exam readiness.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-[#172B3A]/60">
          Calculating progress metrics...
        </div>
      ) : totalTopics === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-[#172B3A]/20 rounded-md bg-[#FAF8F4] space-y-3">
          <BarChart2 className="w-8 h-8 text-[#172B3A] mx-auto opacity-50" />
          <h3 className="text-base font-bold font-display text-[#172B3A]">
            No progress data yet
          </h3>
          <p className="text-xs text-[#172B3A]/70 max-w-sm mx-auto">
            Complete a few study sessions to see your learning pattern and mastery metrics.
          </p>
          <Link to="/create">
            <Button variant="primary" size="sm">
              Create Study Kit
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60 font-mono">
                Topics Studied
              </span>
              <div className="text-3xl font-extrabold font-mono text-[#172B3A]">{totalTopics}</div>
            </div>

            <div className="p-5 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60 font-mono">
                Avg Quiz Score
              </span>
              <div className="text-3xl font-extrabold font-mono text-[#172B3A]">
                {scoredSessions.length ? `${avgScore}%` : 'N/A'}
              </div>
            </div>

            <div className="p-5 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60 font-mono">
                Mastered
              </span>
              <div className="text-3xl font-extrabold font-mono text-[#172B3A]">{masteredCount}</div>
            </div>

            <div className="p-5 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A]/60 font-mono">
                Revision Time
              </span>
              <div className="text-3xl font-extrabold font-mono text-[#172B3A]">{estimatedTimeMins}m</div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#172B3A]">
              TOPIC MASTERY PATTERNS
            </h3>

            <div className="border border-[#172B3A]/20 rounded-md overflow-hidden bg-[#FAF8F4]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#172B3A]/15 text-xs font-mono uppercase bg-[#172B3A]/5 text-[#172B3A]/70">
                    <th className="p-3.5">Topic</th>
                    <th className="p-3.5">Style</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B3A]/10 text-[#172B3A]">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#172B3A]/5">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressPage;

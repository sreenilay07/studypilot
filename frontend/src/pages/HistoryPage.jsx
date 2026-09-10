import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studyService } from '../services/api';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Search, History, BookOpen, Trash2, ArrowRight } from 'lucide-react';

export function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStyle, setFilterStyle] = useState('ALL');

  useEffect(() => {
    async function loadHistory() {
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
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study session permanently?')) return;
    try {
      await studyService.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = (s.topic || '').toLowerCase().includes(search.toLowerCase());
    const matchesStyle = filterStyle === 'ALL' || s.learningStyle === filterStyle;
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60 font-mono">
          STUDY ARCHIVE
        </span>
        <h1 className="text-3xl font-extrabold text-[#172B3A] font-display mt-0.5">
          Study History
        </h1>
        <p className="text-sm text-[#172B3A]/70 mt-0.5">
          All created study kits, test evaluations, and revision sessions.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4]">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#172B3A]/50 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-9 pr-4 py-2 border border-[#172B3A]/20 rounded bg-[#F5F1E8] text-xs text-[#172B3A] focus:outline-none focus:border-[#172B3A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-[#172B3A]/60 font-mono">Filter Style:</span>
          <select
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            className="px-3 py-2 border border-[#172B3A]/20 rounded bg-[#F5F1E8] text-xs font-medium text-[#172B3A] focus:outline-none"
          >
            <option value="ALL">All Teaching Styles</option>
            <option value="Simple Explanation">Simple Explanation</option>
            <option value="Exam Focused">Exam Focused</option>
            <option value="Professor">Teach Me Like a Professor</option>
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-[#172B3A]/60">
          Loading history records...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-[#172B3A]/20 rounded-md bg-[#FAF8F4] space-y-3">
          <BookOpen className="w-8 h-8 text-[#172B3A] mx-auto opacity-50" />
          <h3 className="text-base font-bold font-display text-[#172B3A]">
            You haven't studied anything yet.
          </h3>
          <p className="text-xs text-[#172B3A]/70 max-w-sm mx-auto">
            Create your first study kit to begin tracking your learning progress.
          </p>
          <Link to="/create">
            <Button variant="primary" size="sm">
              Create Your First Study Kit
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border border-[#172B3A]/20 rounded-md overflow-hidden bg-[#FAF8F4]">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#172B3A]/15 text-xs font-mono uppercase bg-[#172B3A]/5 text-[#172B3A]/70">
                <th className="p-3.5">Topic</th>
                <th className="p-3.5">Learning Style</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B3A]/10 text-[#172B3A]">
              {filteredSessions.map((s) => (
                <tr key={s.id} className="hover:bg-[#172B3A]/5 transition-colors">
                  <td className="p-3.5 font-bold font-display">{s.topic}</td>
                  <td className="p-3.5 text-xs text-[#172B3A]/70">{s.learningStyle || 'Simple Explanation'}</td>
                  <td className="p-3.5 text-xs font-mono text-[#172B3A]/70">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Today'}
                  </td>
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
                  <td className="p-3.5 text-right space-x-2">
                    <Link to={`/study/${s.id}`}>
                      <Button variant="outline" size="sm">
                        Open Kit
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      title="Delete study kit"
                      className="p-1.5 text-[#172B3A]/50 hover:text-[#172B3A] rounded hover:bg-[#172B3A]/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;

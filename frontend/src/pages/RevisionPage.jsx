import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../services/api';
import { Button } from '../components/ui/Button';
import { FiveMinuteSprintView } from '../components/study/FiveMinuteSprintView';
import { BookOpen } from 'lucide-react';

export function RevisionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRevision() {
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
    loadRevision();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <BookOpen className="w-8 h-8 text-[#172B3A] mx-auto animate-pulse" />
        <p className="text-xs font-mono text-[#172B3A]/70">Building targeted 5-minute revision sprint...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#172B3A]/15 pb-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60 font-mono">
          TARGETED REVISION
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] font-display mt-0.5">
          5-Minute Revision Sprint
        </h1>
        <p className="text-xs text-[#172B3A]/70 mt-0.5">
          "I only have to fix this." One weak concept, concentrated practice.
        </p>
      </div>

      <FiveMinuteSprintView
        session={session}
        onComplete={() => navigate(`/study/${id}/quiz`)}
      />
    </div>
  );
}

export default RevisionPage;

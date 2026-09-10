import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { User, Settings, Check } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();
  const [defaultDifficulty, setDefaultDifficulty] = useState('Intermediate');
  const [defaultStyle, setDefaultStyle] = useState('Simple Explanation');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="border-b border-[#172B3A]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#172B3A]/60 font-mono">
          SYSTEM PREFERENCES
        </span>
        <h1 className="text-3xl font-extrabold text-[#172B3A] font-display mt-0.5">
          Settings
        </h1>
        <p className="text-sm text-[#172B3A]/70 mt-0.5">
          Manage your study workspace parameters and personal preferences.
        </p>
      </div>

      {/* Account Details Box */}
      <div className="p-6 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#172B3A]/10 pb-3">
          <User className="w-4 h-4 text-[#172B3A]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B3A] font-display">
            Student Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-[#172B3A]/60 block uppercase">Name</span>
            <span className="font-semibold text-[#172B3A] text-sm mt-0.5 block">{user?.name || 'Student'}</span>
          </div>

          <div>
            <span className="font-bold text-[#172B3A]/60 block uppercase">Email Address</span>
            <span className="font-mono text-[#172B3A] text-sm mt-0.5 block">{user?.email || 'user@studypilot.edu'}</span>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSave} className="p-6 border border-[#172B3A]/20 rounded-md bg-[#FAF8F4] space-y-6">
        <div className="flex items-center gap-2 border-b border-[#172B3A]/10 pb-3">
          <Settings className="w-4 h-4 text-[#172B3A]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#172B3A] font-display">
            Learning Preferences
          </h3>
        </div>

        {/* Default Difficulty */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A]">
            Default Academic Difficulty
          </label>
          <select
            value={defaultDifficulty}
            onChange={(e) => setDefaultDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-[#172B3A]/30 rounded bg-[#F5F1E8] text-xs font-medium text-[#172B3A] focus:outline-none"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="University Level">University Level</option>
          </select>
        </div>

        {/* Default Teaching Style */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A]">
            Default Teaching Style
          </label>
          <select
            value={defaultStyle}
            onChange={(e) => setDefaultStyle(e.target.value)}
            className="w-full px-3 py-2 border border-[#172B3A]/30 rounded bg-[#F5F1E8] text-xs font-medium text-[#172B3A] focus:outline-none"
          >
            <option value="Simple Explanation">Simple Explanation</option>
            <option value="Exam Focused">Exam Focused</option>
            <option value="Professor">Teach Me Like a Professor</option>
          </select>
        </div>

        {/* Action */}
        <div className="pt-4 border-t border-[#172B3A]/10 flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-semibold text-[#172B3A] flex items-center gap-1">
              <Check className="w-4 h-4 stroke-[3]" /> Preferences Saved
            </span>
          ) : (
            <span />
          )}
          <Button type="submit" variant="primary" size="md">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPage;

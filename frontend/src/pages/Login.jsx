import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { OpeningAnimation } from '../components/ui/OpeningAnimation';
import { AlertCircle } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showAnimation, setShowAnimation] = useState(() => {
    return !sessionStorage.getItem('studypilot_intro_played');
  });

  const handleAnimationComplete = () => {
    sessionStorage.setItem('studypilot_intro_played', 'true');
    setShowAnimation(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 relative">
      {showAnimation && (
        <OpeningAnimation onComplete={handleAnimationComplete} />
      )}

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <Logo showTagline size="lg" />
        </div>

        {/* Login Form Container */}
        <div className="p-8 border-2 border-[#172B3A] rounded-md bg-[#FAF8F4] space-y-6 shadow-sm">
          <div className="border-b border-[#172B3A]/10 pb-4">
            <h2 className="text-xl font-bold font-display text-[#172B3A]">
              Sign in to StudyPilot
            </h2>
            <p className="text-xs text-[#172B3A]/70 mt-0.5">
              Access your personalized study desk and revision history.
            </p>
          </div>

          {error && (
            <div className="p-3 border border-[#172B3A] rounded bg-[#F5F1E8] flex items-center gap-2 text-xs text-[#172B3A]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-3.5 py-2.5 border-2 border-[#172B3A] rounded-md bg-[#F5F1E8] text-sm text-[#172B3A] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172B3A]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border-2 border-[#172B3A] rounded-md bg-[#F5F1E8] text-sm text-[#172B3A] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-4 border-t border-[#172B3A]/10 text-center text-xs text-[#172B3A]/70">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#172B3A] hover:underline">
              Create account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

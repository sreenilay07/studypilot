import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#F5F1E8] border-b border-[#172B3A]/15 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 font-display font-extrabold text-xl text-[#172B3A] tracking-tight">
            <BookOpen className="w-5 h-5 text-[#172B3A]" />
            <span>STUDYPILOT</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 text-xs">
                <span className="font-semibold text-[#172B3A]">{user.name || user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-3.5 h-3.5 mr-1" /> Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

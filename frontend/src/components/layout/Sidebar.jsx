import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import {
  Home,
  PlusSquare,
  History,
  BarChart2,
  Settings,
  LogOut,
  User,
  BookOpen
} from 'lucide-react';

export function Sidebar({ onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Create Study Kit', path: '/create', icon: PlusSquare },
    { label: 'Study History', path: '/history', icon: History },
    { label: 'Progress', path: '/progress', icon: BarChart2 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-[230px] h-full flex flex-col bg-[#F5F1E8] border-r border-[#172B3A]/15 select-none shrink-0">
      {/* Wordmark Header */}
      <div className="p-6 border-b border-[#172B3A]/10">
        <NavLink to="/" onClick={onCloseMobile} className="block group">
          <Logo showTagline size="md" />
        </NavLink>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-[#172B3A]/50 uppercase tracking-wider px-3 mb-2">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#172B3A] text-[#F5F1E8]'
                  : 'text-[#172B3A] hover:bg-[#172B3A]/5'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F5F1E8]' : 'text-[#172B3A]/70'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-[#172B3A]/10 space-y-1.5">
        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          className={`flex items-center gap-3 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/settings'
              ? 'bg-[#172B3A] text-[#F5F1E8]'
              : 'text-[#172B3A] hover:bg-[#172B3A]/5'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </NavLink>

        {user ? (
          <div className="pt-2 mt-2 border-t border-[#172B3A]/10">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[#172B3A]">
              <div className="flex items-center gap-2 truncate pr-2">
                <div className="w-6 h-6 rounded-full bg-[#172B3A]/10 flex items-center justify-center text-[11px] font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-medium truncate">{user.name || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="text-[#172B3A]/60 hover:text-[#172B3A] p-1 rounded hover:bg-[#172B3A]/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <NavLink
            to="/login"
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-3.5 py-2 text-sm font-medium text-[#172B3A] hover:bg-[#172B3A]/5 rounded-md"
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Sign In</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

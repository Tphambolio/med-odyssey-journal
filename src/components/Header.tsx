import { Link } from 'react-router-dom';
import { Sailboat, LogOut, User, Map, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onAuthClick: () => void;
}

export function Header({ onAuthClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Sailboat className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Med Odyssey Journal</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Your Mediterranean sailing companion</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            to="/blog"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
          <Link
            to="/map"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

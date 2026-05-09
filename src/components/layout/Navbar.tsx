import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Scissors } from 'lucide-react';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

export const Navbar = () => {
  const { currentUser, userData } = useAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <Scissors size={20} />
          </div>
          SalonSync
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-muted hover:text-primary font-medium transition-colors">Find Salons</Link>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-muted hover:text-primary font-medium transition-colors">Dashboard</Link>
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <span className="text-sm font-medium text-primary flex items-center gap-2">
                  <User size={16} /> {userData?.name || 'User'}
                </span>
                <button onClick={handleLogout} className="text-muted hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-primary font-medium hover:text-accent transition-colors">Log In</Link>
              <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
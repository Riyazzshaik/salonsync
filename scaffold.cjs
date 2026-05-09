const fs = require('fs');
const path = require('path');

const dirs = [
  'src/components',
  'src/components/ui',
  'src/components/layout',
  'src/pages',
  'src/context',
  'src/hooks',
  'src/types'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

const files = {
  'src/types/index.ts': `
export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  createdAt: any;
}

export interface Salon {
  salonId: string;
  name: string;
  address: string;
  services: string[];
  currentQueueLength: number;
  averageServiceTime: number; // in minutes
  estimatedWaitTime: number; // in minutes
  rating: number;
  image: string;
  createdAt: any;
}

export interface Booking {
  bookingId: string;
  customerId: string;
  salonId: string;
  service: string;
  slotTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: any;
}
  `,
  'src/context/AuthContext.tsx': `
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user document
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as User);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
  `,
  'src/components/layout/Navbar.tsx': `
import React from 'react';
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
          <Link to="/salons" className="text-muted hover:text-primary font-medium transition-colors">Find Salons</Link>
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
  `,
  'src/components/layout/Footer.tsx': `
import React from 'react';
import { Scissors } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-xl mb-4">
            <div className="bg-white text-primary p-1.5 rounded-lg">
              <Scissors size={20} />
            </div>
            SalonSync
          </div>
          <p className="text-gray-400 max-w-sm">
            Skip the Wait. Book Smarter. Find nearby salons, check live wait times, and reserve your slot instantly.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-accent transition-colors">Find Salons</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">For Salon Owners</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} SalonSync. All rights reserved.
      </div>
    </footer>
  );
};
  `,
  'src/App.tsx': `
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages placeholders
const LandingPage = () => <div className="min-h-screen pt-20 text-center"><h1>Landing Page</h1></div>;
const Login = () => <div className="min-h-screen pt-20 text-center"><h1>Login</h1></div>;
const Signup = () => <div className="min-h-screen pt-20 text-center"><h1>Signup</h1></div>;
const Salons = () => <div className="min-h-screen pt-20 text-center"><h1>Nearby Salons</h1></div>;
const Dashboard = () => <div className="min-h-screen pt-20 text-center"><h1>Dashboard</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/salons" element={<Salons />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
  `,
  'src/main.tsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
  `
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(__dirname, file), content.trim());
});
console.log('Scaffolding complete.');

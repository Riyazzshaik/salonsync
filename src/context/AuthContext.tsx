import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleError } from '../utils/errorHandler';
import type { User } from '../types';

/**
 * AUTHENTICATION CONTEXT
 * Provides a global state for the authenticated user and their Firestore-synced profile data.
 * Patterns used:
 * - Real-time Auth State Listeners: Synchronizes Firebase Auth with custom user roles.
 * - Role-Based Access Control: Exposes 'userData' with roles (customer, owner, admin).
 * - Persistence Management: Ensures sessions survive browser reloads.
 */
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

import { PageLoader } from '../components/ui/PageLoader';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 5-second Safety Timeout to prevent blank screen on network/config issues
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization timed out (10s). Proceeding to allow app render.");
        setLoading(false);
      }
    }, 10000);

    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        handleError("AuthContext.persistence", err);
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        clearTimeout(safetyTimeout);
        setCurrentUser(user);
        
        if (user) {
          try {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserData(docSnap.data() as User);
            } else {
              console.warn("Authenticated user has no Firestore profile. Uid:", user.uid);
            }
          } catch (e) {
            handleError("AuthContext.userData", e);
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      }, (error) => {
        clearTimeout(safetyTimeout);
        handleError("AuthContext.stateChange", error);
        setLoading(false);
      });

      return unsubscribe;
    };
    
    const unsubscribePromise = initAuth();
    
    return () => {
      clearTimeout(safetyTimeout);
      unsubscribePromise.then(unsub => unsub && unsub());
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading }}>
      {loading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
};
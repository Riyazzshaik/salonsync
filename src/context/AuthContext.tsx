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

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        handleError("AuthContext.persistence", err);
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            // Fetch user document
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserData(docSnap.data() as User);
            }
          } catch (e) {
            handleError("AuthContext.userData", e);
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      }, (error) => {
        handleError("AuthContext.stateChange", error);
        setLoading(false);
      });

      return unsubscribe;
    };
    
    const unsubscribePromise = initAuth();
    
    return () => {
      unsubscribePromise.then(unsub => unsub && unsub());
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
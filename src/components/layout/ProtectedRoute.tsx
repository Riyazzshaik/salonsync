import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SalonService } from '../../services/salons/salonService';
import { getRedirectPath } from '../../utils/navigation';
import type { Salon } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'owner' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salonLoading, setSalonLoading] = useState(true);

  useEffect(() => {
    const checkSalon = async () => {
      if (userData?.role === 'owner') {
        const salonData = await SalonService.getOwnerSalon(userData.uid);
        setSalon(salonData);
      }
      setSalonLoading(false);
    };

    if (!authLoading && userData) {
      checkSalon();
    } else if (!authLoading) {
      setSalonLoading(false);
    }
  }, [authLoading, userData]);

  if (authLoading || salonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    return <Navigate to={getRedirectPath(userData, salon)} replace />;
  }
  
  // Special case: Owner trying to access registration but already has a salon
  if (userData?.role === 'owner' && salon && window.location.pathname === '/owner/register-salon') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return <>{children}</>;
};

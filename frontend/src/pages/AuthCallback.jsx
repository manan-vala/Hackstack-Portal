import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchUserAndLogin = async () => {
      try {
        // Fetch user data via API - token is in HttpOnly cookie (automatically sent)
        const userData = await authService.getCurrentUser();
        login(null, userData); // null token since it's in cookie
        navigate('/dashboard');
      } catch (err) {
        console.error('Authentication failed:', err);
        navigate('/login?error=auth_failed');
      }
    };

    fetchUserAndLogin();
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
      <p className="text-slate-400 text-sm tracking-wide">Syncing account security configurations...</p>
    </div>
  );
};

export default AuthCallback;

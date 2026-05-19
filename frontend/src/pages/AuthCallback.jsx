import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const avatarUrl = searchParams.get('avatarUrl');
    const id = searchParams.get('id');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (token && id) {
      // Package details parsed back from query variables or standard API package
      const userPayload = { _id: id, username, email, avatarUrl, isAdmin };
      
      // Save state down to localStorage and local hook state
      login(token, userPayload);
      
      // Push context forward safely to dashboard
      navigate('/dashboard');
    } else {
      console.error('Authentication parameters missing.');
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
      <p className="text-slate-400 text-sm tracking-wide">Syncing account security configurations...</p>
    </div>
  );
};

export default AuthCallback;

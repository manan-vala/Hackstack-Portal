import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchUserAndLogin = async () => {
      try {
        const userData = await authService.getCurrentUser();
        login(null, userData);

        if (!userData.profileCompleted) {
          navigate('/onboarding');
        } else {
          // Check if this user is a whitelisted admin
          try {
            const adminRes = await fetch("/api/auth/admin-check");
            const adminData = await adminRes.json();
            
            if (adminData.authorized) {
              localStorage.setItem("jwt", adminData.token);
              localStorage.setItem("adminUser", JSON.stringify(adminData.user));
              localStorage.removeItem("admin_login_redirect");
              window.location.assign("/admin/dashboard");
              return;
            }
          } catch (adminErr) {
            // Ignore error
          }

          // Not an admin or check failed: redirect to user dashboard
          localStorage.removeItem("admin_login_redirect");
          navigate('/dashboard');
        }
      } catch (err) {
        navigate('/login.html?error=auth_failed');
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

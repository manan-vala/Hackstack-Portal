import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './onboarding.css';

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const Onboarding = () => {
  const { user, loading, login, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    college: '',
    year: '',
    mobileNumber: '',
    email: '',
  });

  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [collegesList, setCollegesList] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const collegeRef = useRef(null);

  // Pre-fill email and name from user's Google account
  useEffect(() => {
    if (user?.email) {
      setForm(prev => ({ ...prev, email: user.email }));
    }
    if (user?.name) {
      setForm(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Redirect if not logged in or already completed
  useEffect(() => {
    if (!loading && !user) {
      window.location.assign('/login.html');
    }
    if (!loading && user?.profileCompleted) {
      navigate('/dashboard');
    }
  }, [loading, user, navigate]);

  // Fetch existing colleges list for suggestions
  useEffect(() => {
    async function fetchColleges() {
      try {
        const data = await authService.getColleges();
        setCollegesList(data);
      } catch (err) {
        console.error("Failed to load college suggestions:", err);
      }
    }
    fetchColleges();
  }, []);

  // Handle click outside suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (collegeRef.current && !collegeRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter college list based on user input
  const filteredColleges = useMemo(() => {
    const query = form.college.trim().toLowerCase();
    if (!query) {
      return collegesList.slice(0, 6);
    }
    return collegesList
      .filter((c) => c.toLowerCase().includes(query) && c.toLowerCase() !== query)
      .slice(0, 6);
  }, [form.college, collegesList]);

  const handleSelectCollege = (collegeName) => {
    setForm((prev) => ({ ...prev, college: collegeName }));
    setErrors((prev) => ({ ...prev, college: '' }));
    setShowSuggestions(false);
  };

  // Debounced username check
  const checkUsernameRef = useRef(
    debounce(async (username) => {
      if (!username || username.length < 3) {
        setUsernameStatus({ checking: false, available: null, message: 'At least 3 characters' });
        return;
      }
      setUsernameStatus({ checking: true, available: null, message: 'Checking...' });
      try {
        const result = await authService.checkUsername(username);
        setUsernameStatus({
          checking: false,
          available: result.available,
          message: result.available ? 'Username is available!' : 'Username is already taken',
        });
      } catch {
        setUsernameStatus({ checking: false, available: null, message: 'Could not check availability' });
      }
    }, 500)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitError('');

    if (name === 'username') {
      checkUsernameRef.current(value.trim());
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (form.username.trim().length < 3) newErrors.username = 'At least 3 characters';
    else if (!/^[a-zA-Z0-9_.-]+$/.test(form.username.trim())) newErrors.username = 'Letters, numbers, _ . - only';
    if (!form.college.trim()) newErrors.college = 'College is required';
    if (!form.year) newErrors.year = 'Year is required';
    if (!form.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(form.mobileNumber.trim())) newErrors.mobileNumber = 'Enter a valid 10-digit number';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = 'Enter a valid email';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (usernameStatus.available === false) {
      setErrors({ username: 'Username is already taken' });
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const profileData = {
        name: form.name.trim(),
        username: form.username.trim(),
        college: form.college.trim(),
        year: form.year,
        mobileNumber: form.mobileNumber.trim(),
        email: form.email.trim(),
      };

      const updatedUser = await authService.completeProfile(profileData);
      login(null, updatedUser);

      // Refresh to get full user data including profileCompleted flag
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="onboarding-page">
        <p style={{ color: '#8899bb', fontFamily: 'VT323, monospace', fontSize: '1.3rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <h1>Welcome to Hackstack</h1>
        <p>Complete your profile to get started</p>
      </div>

      <div className="onboarding-card">
        <div className="onboarding-card-title">Profile setup</div>
        <div className="onboarding-card-subtitle">Tell us a bit about yourself</div>

        {submitError && (
          <div className="onboarding-error-banner">{submitError}</div>
        )}

        <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
          <div className="onboarding-field">
            <label htmlFor="onb-name">Full Name</label>
            <input
              id="onb-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={errors.name ? 'is-error' : ''}
              autoComplete="name"
            />
            <span className={`onboarding-field-hint ${errors.name ? 'is-error' : ''}`}>
              {errors.name || ''}
            </span>
          </div>

          <div className="onboarding-field">
            <label htmlFor="onb-username">Username</label>
            <input
              id="onb-username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a unique display name"
              className={
                errors.username ? 'is-error' :
                usernameStatus.available === true ? 'is-valid' : ''
              }
              autoComplete="off"
            />
            <span className={`onboarding-field-hint ${
              errors.username ? 'is-error' :
              usernameStatus.available === true ? 'is-success' :
              usernameStatus.available === false ? 'is-error' : ''
            }`}>
              {errors.username || usernameStatus.message || 'Letters, numbers, underscores, dots, dashes'}
            </span>
          </div>

          <div className="onboarding-field" ref={collegeRef}>
            <label htmlFor="onb-college">College / Institution</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                id="onb-college"
                type="text"
                name="college"
                value={form.college}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g. IIT Guwahati"
                className={errors.college ? 'is-error' : ''}
                autoComplete="off"
              />
              {showSuggestions && filteredColleges.length > 0 && (
                <div className="onboarding-suggestions-dropdown">
                  {filteredColleges.map((col) => (
                    <div
                      key={col}
                      className="onboarding-suggestion-item"
                      onClick={() => handleSelectCollege(col)}
                    >
                      {col}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className={`onboarding-field-hint ${errors.college ? 'is-error' : ''}`}>
              {errors.college || ''}
            </span>
          </div>

          <div className="onboarding-row">
            <div className="onboarding-field">
              <label htmlFor="onb-year">Year</label>
              <select
                id="onb-year"
                name="year"
                value={form.year}
                onChange={handleChange}
                className={errors.year ? 'is-error' : ''}
              >
                <option value="">Select year</option>
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className={`onboarding-field-hint ${errors.year ? 'is-error' : ''}`}>
                {errors.year || ''}
              </span>
            </div>

            <div className="onboarding-field">
              <label htmlFor="onb-mobile">Mobile Number</label>
              <input
                id="onb-mobile"
                type="tel"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                placeholder="10-digit number"
                className={errors.mobileNumber ? 'is-error' : ''}
                autoComplete="tel"
                maxLength={10}
              />
              <span className={`onboarding-field-hint ${errors.mobileNumber ? 'is-error' : ''}`}>
                {errors.mobileNumber || ''}
              </span>
            </div>
          </div>

          <div className="onboarding-field">
            <label htmlFor="onb-email">Email</label>
            <input
              id="onb-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={errors.email ? 'is-error' : ''}
              autoComplete="email"
            />
            <span className={`onboarding-field-hint ${errors.email ? 'is-error' : ''}`}>
              {errors.email || 'Pre-filled from your Google account'}
            </span>
          </div>

          <button
            type="submit"
            className="onboarding-submit"
            disabled={submitting}
          >
            {submitting ? 'Setting up...' : 'Launch Dashboard →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;

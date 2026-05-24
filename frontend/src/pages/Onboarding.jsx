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
    rollNumber: '',
    programme: '',
    countryCode: '+91',
    mobileNumber: '',
    email: '',
  });

  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
  const [isCustomCountryCode, setIsCustomCountryCode] = useState(false);
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
      window.location.assign('/hackstack/login.html');
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
        // Silent fail for suggestions
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
    if (!form.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!form.programme) newErrors.programme = 'Programme is required';
    if (!form.countryCode.trim()) newErrors.countryCode = 'Country code is required';
    else if (!/^\+[0-9]{1,4}$/.test(form.countryCode.trim())) newErrors.countryCode = 'Must be + followed by 1-4 digits';
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
        rollNumber: form.rollNumber.trim(),
        programme: form.programme,
        countryCode: form.countryCode.trim(),
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
              <label htmlFor="onb-rollNumber">Roll Number</label>
              <input
                id="onb-rollNumber"
                type="text"
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                placeholder="e.g. 210101001"
                className={errors.rollNumber ? 'is-error' : ''}
              />
              <span className={`onboarding-field-hint ${errors.rollNumber ? 'is-error' : ''}`}>
                {errors.rollNumber || ''}
              </span>
            </div>
          </div>

          <div className="onboarding-row">
            <div className="onboarding-field">
              <label htmlFor="onb-programme">Programme</label>
              <select
                id="onb-programme"
                name="programme"
                value={form.programme}
                onChange={handleChange}
                className={errors.programme ? 'is-error' : ''}
              >
                <option value="">Select programme</option>
                <option value="Btech">B.Tech</option>
                <option value="Mtech">M.Tech</option>
                <option value="B.Des">B.Des</option>
                <option value="Others">Others</option>
              </select>
              <span className={`onboarding-field-hint ${errors.programme ? 'is-error' : ''}`}>
                {errors.programme || ''}
              </span>
            </div>

            <div className="onboarding-field">
              <label htmlFor="onb-mobile">Mobile Number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isCustomCountryCode ? (
                  <div style={{ display: 'flex', gap: '4px', width: '130px', flexShrink: 0 }}>
                    <input
                      type="text"
                      name="countryCode"
                      value={form.countryCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\+?[0-9]*$/.test(val)) {
                          handleChange(e);
                        }
                      }}
                      placeholder="+XX"
                      maxLength={5}
                      style={{ width: '80px', flexShrink: 0 }}
                      className={errors.countryCode ? 'is-error' : ''}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCountryCode(false);
                        setForm(prev => ({ ...prev, countryCode: '+91' }));
                        setErrors(prev => ({ ...prev, countryCode: '' }));
                      }}
                      style={{
                        flexGrow: 1,
                        padding: '0 4px',
                        fontSize: '0.9rem',
                        background: '#cbd5e1',
                        border: '2px solid #94a3b8',
                        borderRadius: '4px',
                        color: '#1e293b',
                        cursor: 'pointer',
                        fontFamily: 'VT323, monospace',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      List
                    </button>
                  </div>
                ) : (
                  <select
                    id="onb-countryCode"
                    name="countryCode"
                    value={form.countryCode}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomCountryCode(true);
                        setForm(prev => ({ ...prev, countryCode: '' }));
                      } else {
                        handleChange(e);
                      }
                    }}
                    style={{ width: '130px', flexShrink: 0 }}
                    className={errors.countryCode ? 'is-error' : ''}
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+86">+86 (CN)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+33">+33 (FR)</option>
                    <option value="+81">+81 (JP)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="custom">Other...</option>
                  </select>
                )}
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
                  style={{ flexGrow: 1 }}
                />
              </div>
              <span className={`onboarding-field-hint ${errors.mobileNumber || errors.countryCode ? 'is-error' : ''}`}>
                {errors.mobileNumber || errors.countryCode || ''}
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

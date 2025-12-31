import React, { useState } from 'react';
import { useSession } from '../context/SessionContext.jsx';

function LandingPopup({ onClose, onLogin }) {
  const { signinWithPassword, signup, signinWithOTP, verifyOTP } = useSession();
  
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'otp'
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState('email'); // 'email', 'code', 'reset'
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('email'); // 'email', 'verify'
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const sendEmail = async (to, subject, body) => {
    // Simulate email sending - in production, this would call a backend API
    console.log('📧 Email Sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    // Show success message to user
    setSuccess(`Email sent to ${to}! Check your inbox.`);
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleContinueAsGuest = () => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      username: 'guest',
      email: 'guest@tracklist.com',
      isGuest: true,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('tracklistCurrentUser', JSON.stringify(guestUser));
    onLogin(guestUser);
    onClose();
  };

  // OTP Login Functions - Using Real Backend
  const handleSendOTP = async () => {
    if (!otpEmail) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(otpEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signinWithOTP(otpEmail);
      
      if (result.success) {
        setSuccess('OTP sent to your email! Please check your inbox.');
        setOtpStep('verify');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('OTP send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      setError('Please enter the OTP code');
      return;
    }

    if (otpCode.length !== 6) {
      setError('OTP code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await verifyOTP(otpEmail, otpCode);
      
      if (result.success && result.user) {
        setSuccess('Login successful!');
        localStorage.setItem('tracklistCurrentUser', JSON.stringify(result.user));
        onLogin(result.user);
        onClose();
      } else {
        setError(result.error || 'Invalid OTP code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('OTP verify error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!resetUsername) {
      setError('Please enter your username');
      return;
    }

    const users = JSON.parse(localStorage.getItem('tracklistUsers') || '[]');
    const user = users.find(u => u.username === resetUsername);

    if (!user) {
      setError('Username not found');
      return;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    // Send email with code
    sendEmail(
      user.email,
      'TrackList - Password Reset Code',
      `Your password reset code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    );

    setVerificationStep('code');
    setError('');
  };

  const handleVerifyCode = () => {
    if (verificationCode !== generatedCode) {
      setError('Invalid verification code. Please try again.');
      return;
    }

    setVerificationStep('reset');
    setError('');
    setSuccess('Code verified! Please enter your new password.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResetPassword = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const users = JSON.parse(localStorage.getItem('tracklistUsers') || '[]');
    const userIndex = users.findIndex(u => u.username === resetUsername);

    if (userIndex !== -1) {
      users[userIndex].password = formData.password;
      localStorage.setItem('tracklistUsers', JSON.stringify(users));

      setSuccess('Password reset successfully! You can now login.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setVerificationStep('email');
        setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });
        setResetUsername('');
        setVerificationCode('');
        setGeneratedCode('');
        setSuccess('');
      }, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (authMode === 'login') {
      // Login validation
      if (!formData.email || !formData.password) {
        setError('Please enter email and password');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // Use email and password for backend authentication
        const result = await signinWithPassword(formData.email, formData.password);
        
        if (result.success && result.user) {
          setSuccess('Login successful!');
          localStorage.setItem('tracklistCurrentUser', JSON.stringify(result.user));
          onLogin(result.user);
          onClose();
        } else {
          setError(result.error || 'Invalid email or password');
        }
      } catch (err) {
        setError('Login failed. Please try again.');
        console.error('Login error:', err);
      } finally {
        setIsLoading(false);
      }
    } else if (authMode === 'signup') {
      // Signup validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const result = await signup(formData.email, formData.password);
        
        if (result.success && result.user) {
          setSuccess('Account created successfully!');
          
          // Send welcome email
          sendEmail(
            formData.email,
            'Welcome to TrackList!',
            `Hi ${formData.name},\n\nYour account is created and live! Enjoy organizing your life with TrackList.\n\nEmail: ${formData.email}\n\nGet started now and track everything that matters.\n\n- The TrackList Team`
          );
          
          localStorage.setItem('tracklistCurrentUser', JSON.stringify(result.user));
          onLogin(result.user);
          onClose();
        } else {
          setError(result.error || 'Signup failed. Please try again.');
        }
      } catch (err) {
        setError('Signup failed. Please try again.');
        console.error('Signup error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Forgot Password Flow
  if (isForgotPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] animate-fadeIn px-4">
        <div className="bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-3xl w-full max-w-md shadow-2xl border border-gray-800 transform transition-all duration-300 animate-scaleIn">
          {/* Header */}
          <div className="text-center pt-12 pb-8 px-8 border-b border-gray-800">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#007aff] via-[#5ac8fa] to-[#32d74b] bg-clip-text text-transparent mb-4">
              Reset Password
            </h1>
            <p className="text-sm text-gray-400">
              {verificationStep === 'email' && "We'll send you a verification code"}
              {verificationStep === 'code' && "Enter the 6-digit code from your email"}
              {verificationStep === 'reset' && "Create your new password"}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {verificationStep === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Username</label>
                  <input
                    type="text"
                    value={resetUsername}
                    onChange={(e) => {
                      setResetUsername(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your username"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500 transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                    {success}
                  </div>
                )}

                <button
                  onClick={handleForgotPassword}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#007aff] to-[#5ac8fa] shadow-lg shadow-[#007aff]/30 transition-all hover:scale-[1.02]"
                >
                  Send Verification Code
                </button>
              </div>
            )}

            {verificationStep === 'code' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">6-Digit Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500 transition-all text-center text-2xl tracking-widest"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                    {success}
                  </div>
                )}

                <button
                  onClick={handleVerifyCode}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#007aff] to-[#5ac8fa] shadow-lg shadow-[#007aff]/30 transition-all hover:scale-[1.02]"
                >
                  Verify Code
                </button>

                <button
                  onClick={() => setVerificationStep('email')}
                  className="w-full py-3 rounded-xl font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-all"
                >
                  Resend Code
                </button>
              </div>
            )}

            {verificationStep === 'reset' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter new password"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500 transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                    {success}
                  </div>
                )}

                <button
                  onClick={handleResetPassword}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#32d74b] to-[#30d158] shadow-lg shadow-[#32d74b]/30 transition-all hover:scale-[1.02]"
                >
                  Reset Password
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setIsForgotPassword(false);
                setVerificationStep('email');
                setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });
                setResetUsername('');
                setVerificationCode('');
                setGeneratedCode('');
                setError('');
                setSuccess('');
              }}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-gray-400 hover:text-white transition-all"
            >
              ← Back to Login
            </button>
          </div>
        </div>

        <style>{`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}</style>
      </div>
    );
  }

  // OTP Login Flow
  if (authMode === 'otp') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] animate-fadeIn px-4">
        <div className="bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-3xl w-full max-w-md shadow-2xl border border-gray-800 transform transition-all duration-300 animate-scaleIn">
          {/* Header */}
          <div className="text-center pt-12 pb-8 px-8 border-b border-gray-800">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff9500] via-[#ff375f] to-[#bf5af2] bg-clip-text text-transparent mb-4">
              Login with OTP
            </h1>
            <p className="text-sm text-gray-400">
              {otpStep === 'email' ? "Enter your email to receive a one-time password" : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {otpStep === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Email Address</label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => {
                      setOtpEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your email"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff9500] placeholder-gray-500 transition-all"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                    {success}
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff9500] to-[#ff375f] shadow-lg shadow-[#ff9500]/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </div>
            )}

            {otpStep === 'verify' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Enter OTP Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff9500] placeholder-gray-500 transition-all text-center text-2xl tracking-widest"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Code sent to {otpEmail}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                    {success}
                  </div>
                )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff9500] to-[#ff375f] shadow-lg shadow-[#ff9500]/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button
                  onClick={() => {
                    setOtpStep('email');
                    setOtpCode('');
                    setError('');
                  }}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-all disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setAuthMode('login');
                setOtpStep('email');
                setOtpEmail('');
                setOtpCode('');
                setError('');
                setSuccess('');
              }}
              disabled={isLoading}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-gray-400 hover:text-white transition-all"
            >
              ← Back to Login Options
            </button>
          </div>
        </div>

        <style>{`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}</style>
      </div>
    );
  }

  // Main Login/Signup Form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] animate-fadeIn px-4">
      <div className="bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-3xl w-full max-w-md shadow-2xl border border-gray-800 transform transition-all duration-300 animate-scaleIn">
        {/* Header Section */}
        <div className="text-center pt-12 pb-8 px-8 border-b border-gray-800">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#007aff] via-[#5ac8fa] to-[#32d74b] bg-clip-text text-transparent mb-4">
            TrackList
          </h1>
          <p className="text-xl font-semibold text-gray-300 mb-3">
            Your Life, Organized
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Track your goals, manage daily tasks, and build custom lists to stay on top of everything that matters. Simple, powerful, and built for you.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccess('');
                setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });
              }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                authMode === 'login'
                  ? 'bg-[#007aff] text-white shadow-lg shadow-[#007aff]/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setError('');
                setSuccess('');
                setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });
              }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                authMode === 'signup'
                  ? 'bg-[#32d74b] text-white shadow-lg shadow-[#32d74b]/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32d74b] placeholder-gray-500 transition-all"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500 transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007aff] placeholder-gray-500 transition-all"
                disabled={isLoading}
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32d74b] placeholder-gray-500 transition-all"
                  disabled={isLoading}
                />
              </div>
            )}

            {authMode === 'login' && (
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-[#007aff] hover:text-[#5ac8fa] transition-colors"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('otp')}
                  className="text-sm text-[#ff9500] hover:text-[#ff375f] transition-colors font-semibold"
                >
                  Login with OTP →
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-[#007aff] to-[#5ac8fa] shadow-[#007aff]/30'
                  : 'bg-gradient-to-r from-[#32d74b] to-[#30d158] shadow-[#32d74b]/30'
              }`}
            >
              {isLoading ? (authMode === 'login' ? 'Logging in...' : 'Creating account...') : (authMode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </form>

          {/* Continue as Guest */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <button
              onClick={handleContinueAsGuest}
              className="w-full py-4 rounded-xl font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-all border border-gray-700 hover:border-gray-600"
            >
              Continue as Guest
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Guest mode: Your data won't be saved permanently
            </p>
          </div>

          {authMode === 'signup' && (
            <p className="text-xs text-gray-500 text-center mt-4">
              By signing up, you agree to receive updates via email
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
}

export default LandingPopup;

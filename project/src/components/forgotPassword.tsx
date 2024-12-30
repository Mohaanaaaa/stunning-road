import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import logger from './logger'; // Import logger utility
import { AlertCircle,ShieldCheck } from 'lucide-react';
import { getDailyQuote } from '../quotes';



const ForgotPassword: React.FC = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false); // Track if email is verified
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false); // Email verification loading state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false); // Track visibility of new password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Track visibility of confirm password

  // Function to validate password
  const validatePassword = (password: string) => {
    const upperCasePattern = /[A-Z]/;
    const lowerCasePattern = /[a-z]/;
    const numberPattern = /[0-9]/;
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    } else if (!upperCasePattern.test(password) || 
               !lowerCasePattern.test(password) || 
               !numberPattern.test(password) || 
               !specialCharPattern.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }
    return '';
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setEmailValid(false);
    setEmailError('');

    if (inputEmail.length > 0) {
      setLoading(true);
      logger.info('Starting email verification', { email: inputEmail });
      try {
        const response = await axios.post('http://localhost:5000/api/verify-email', { email: inputEmail });
        if (response.data.success) {
          setEmailValid(true);
          logger.info('Email verified successfully', { email: inputEmail });
        } else {
          setEmailError(response.data.message || 'Email verification failed');
          logger.warn('Email verification failed', { email: inputEmail });
        }
      } catch (err: any) {
        setEmailError(err.response?.data?.message || 'Error verifying email');
        logger.error('Error during email verification', { email: inputEmail, error: err.response?.data });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);

    const validationMessage = validatePassword(password);
    setPasswordStrength(validationMessage || 'Strong password');

    if (validationMessage) {
      console.warn('Weak password entered');
      //logger.warn('Weak password entered', { password });
    } else {
      console.info('Strong password entered');
      //logger.info('Strong password entered', { password });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      logger.warn('Password mismatch detected', { newPassword, confirmPassword });
      return;
    }

    const strengthValidationError = validatePassword(newPassword);
    if (strengthValidationError) {
      setPasswordError(strengthValidationError);
      logger.warn('Password validation failed', { error: strengthValidationError });
      return;
    }

    logger.info('Attempting password reset', { email });
    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', {
        email,
        password: newPassword,
      });
      if (response.data.success) {
        alert('Password reset successful');
        logger.info('Password reset successful', { email });
        navigate('/');
      } else {
        setPasswordError('Password reset failed');
        logger.error('Password reset failed', { email });
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'An error occurred');
      logger.error('Error during password reset', { email, error: err.response?.data });
    }
  };

  const generateRandomPassword = () => {
    const length = 12; // Desired password length
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    // Combine all characters
    const allChars = upperChars + lowerChars + numbers + specialChars;

    // Generate a password
    let randomPassword = '';
    randomPassword += upperChars[Math.floor(Math.random() * upperChars.length)];
    randomPassword += lowerChars[Math.floor(Math.random() * lowerChars.length)];
    randomPassword += numbers[Math.floor(Math.random() * numbers.length)];
    randomPassword += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the remaining length
    for (let i = 4; i < length; i++) {
      randomPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the characters
    randomPassword = randomPassword.split('').sort(() => 0.5 - Math.random()).join('');

    setNewPassword(randomPassword);
    setPasswordStrength(validatePassword(randomPassword));
    logger.info('Random strong password generated', { randomPassword });
  };

  return (
    <div>
      <nav className="bg-white shadow-md py-4">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Bengaluru Roads</h1>
          </div>
          <button
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2" 
            onClick={() => navigate('/')}
          >
            <ShieldCheck size={20} />
            Back to Home
          </button>
        </div>
      </nav>
       {/* Daily Quote Section */}
      <div className="bg-gray-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-bold text-gray-700 italic">"{getDailyQuote()}"</p>
        </div>
      </div>
      <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded-lg mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleResetPassword}>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className={`w-full border rounded px-3 py-2 ${
                  emailValid ? 'border-green-500' : emailError ? 'border-red-500' : ''
                }`}
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                required
              />
              {loading && <span className="absolute right-3 top-2.5 text-blue-500">Verifying...</span>}
              {emailValid && <span className="absolute right-3 top-2.5 text-green-500">✔</span>}
            </div>
            {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
          </div>

          {/* New Password & Confirm Password Fields (Visible Only After Email Verification) */}
          {emailValid && (
            <>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    className={`w-full border rounded px-3 py-2 ${
                      passwordStrength ? (passwordStrength === 'Strong password' ? 'border-green-500' : 'border-red-500') : ''
                    }`}
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                  <span
                    className="absolute right-3 top-3 cursor-pointer"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? '👁️' : '👁️‍🗨️'} {/* Eye icon */}
                  </span>
                </div>
                {passwordStrength && <p className={`${passwordStrength === 'Strong password' ? 'text-green-600' : 'text-red-600'} text-sm mt-1`}>{passwordStrength}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full border rounded px-3 py-2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <span
                    className="absolute right-3 top-3 cursor-pointer"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'} {/* Eye icon */}
                  </span>
                </div>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
              <button type="button" onClick={generateRandomPassword} className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 mb-4">
                Generate Strong Password
              </button>
            </>
          )}

          {/* Reset Password Button */}
          {emailValid && (
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Reset Password
            </button>
          )}
        </form>
        <footer className="bg-white shadow-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Bengaluru Roads. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>      
  );
};

export default ForgotPassword;
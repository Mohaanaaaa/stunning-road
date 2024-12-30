import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { AlertCircle, ShieldCheck } from 'lucide-react'; 
import { COPYRIGHT_TEXT } from '../copyrights';
import { getDailyQuote } from '../quotes'; 
import axios from 'axios';
import logger from './logger'; // Import the logger utility

const ResetPassword: React.FC = () => {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); 
  const [otpRequestCount, setOtpRequestCount] = useState(0);

  useEffect(() => {
    let timer;
    if (isTimerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000); 
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeRemaining]);

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (isTimerActive) {
      setError(`You can request a new OTP in ${timeRemaining} seconds.`);
      return;
    }

    if (otpRequestCount >= 3) {
      setError("You have reached the maximum number of OTP requests.");
      return;
    }

    try {
      const verificationResponse = await axios.post('http://localhost:5000/api/verify-email', { email });
      
      if (verificationResponse.data.success) {
        await axios.post('http://localhost:5000/api/request-otp', { email });
        logger.info(`OTP sent to ${email}`);  // Log successful OTP request
        setSuccess("OTP sent to your email! Please verify it.");
        setOtpRequestCount(prevCount => prevCount + 1); 
        setIsTimerActive(true);
        setTimeRemaining(300); // 5 minutes = 300 seconds
        setStep(2);
      } else {
        setError("Email verification failed. Please check your email.");
        logger.warn(`Email verification failed for ${email}`); // Log email verification failure
      }
    } catch (err) {
      logger.error(err); // Log error details
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Failed to verify email. Please try again.");
      } else {
        setError("Unexpected error occurred. Please try again.");
        logger.error("Unexpected error occurred during OTP request.");
      }
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.post('http://localhost:5000/api/verify-otp', { email, otp });
      logger.info(`OTP verified for ${email}`); // Log successful OTP verification
      setSuccess("OTP verified successfully! You can now reset your password.");
      setStep(3); 
    } catch (err) {
      setError("Invalid OTP. Please try again.");
      logger.warn(`Invalid OTP for ${email}`); // Log invalid OTP attempt
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      logger.warn("Passwords do not match on reset attempt."); // Log password mismatch
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/reset-password', { email, password: newPassword });
      logger.info(`Password reset successfully for ${email}`); // Log successful password reset
      setSuccess("Password reset successfully!");
      
      setTimeout(() => {
        navigate('/login'); 
      }, 10000);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
      logger.error(`Failed to reset password for ${email}: ${err}`); // Log password reset failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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

      <div className="flex-grow container mx- px-4 sm:px-6 lg:px-8 py-6">
        
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <div className="bg-white shadow rounded-lg p-8 mt-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
          {step === 1 && (
            <form onSubmit={requestOtp}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700">Email:</label>
                <input
                  id="email"
                  type="email"
                  placeholder='E-mail'
                  className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200" disabled={isLoading || otpRequestCount >= 3}>
                {isLoading ? 'Sending OTP...' : 'Request OTP'}
              </button>
              {isTimerActive && (
                <p className="mt-4 text-sm text-gray-600 text-center">
                  Wait {timeRemaining} seconds to request a new OTP.
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600 text-center">
                Remaining OTP requests: {3 - otpRequestCount}
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyOtp}>
              <div className="mb-4">
                <label htmlFor="otp" className="block text-gray-700">Enter OTP:</label>
                <input
                  type="text"
                  id="otp"
                  className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:border-blue-500"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Ensure only digits are allowed and max length is 6
                    if (/^\d*$/.test(value) && value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  required
                  maxLength="6"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordReset}>
              <div className="mb-4">
                <label htmlFor="new-password" className="block text-gray-700">New Password:</label>
                <input
                  type="password"
                  id="new-password"
                  className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:border-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirm-password" className="block text-gray-700">Confirm Password:</label>
                <input
                  type="password"
                  id="confirm-password"
                  className="mt-1 p-2 border border-gray-300 rounded w-full focus:outline-none focus:border-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p onClick={() => alert(COPYRIGHT_TEXT)} className="text-sm text-gray-500 cursor-pointer">
            © {new Date().getFullYear()} Bengaluru Roads. All Rights Reserved.
          </p>
          <p className="text-sm text-gray-600">Click here to view the copyright information</p>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;

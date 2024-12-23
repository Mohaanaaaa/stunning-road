import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle,ShieldCheck} from 'lucide-react';
import { getDailyQuote } from '../quotes';
import logger from './logger'; // Import logger utility


const SendOtp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSendOtpButton, setShowSendOtpButton] = useState(true); // New state variable
  const [showVerifyButton, setShowVerifyButton] = useState(false); // New state variable
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false); // New state variable
  const [attemptsLeft, setAttemptsLeft] = useState(3); // New state variable
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (attemptsLeft <= 0) {
        setError('Too many attempts. Please wait and try again later.');
        logger.warn('Too many attempts ')
        return;
      }

      setAttemptsLeft(attemptsLeft - 1);

      const response = await axios.post('http://localhost:5000/send-otp', { email });
      setMessage(response.data.message);

      setShowSendOtpButton(false); // Hide Send OTP button
      setShowVerifyButton(true); // Show Verify button
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error sending OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      // Only send OTP for verification
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: '',
          otp: ''
        })
      });
      console.log(response); // Log the response
    
      if (response.ok) {
        setShowVerifyButton(false); // Hide Verify button
        setShowNewPasswordForm(true); // Show New Password form
      } else {
        throw new Error('Error verifying OTP');
      }
    } catch (err) {
      setError(err.message || 'Error verifying OTP');
    }
    
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call API to reset password with new password and confirm password
    // ...

    // Navigate to login page or home page after password reset
    navigate('/'); // or navigate('/home')
  };

  return (
    <div>
      <div className="flex justify-between py-4 px-6 bg-white-200">
        <AlertCircle className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800 px-4">Bengaluru Roads</h1>
        <button 
        className="text-gray-600 hover:text-gray-900 flex items-center gap-2" 
        onClick={() => navigate('/')}>
          <ShieldCheck size={20} />
          Back to Home
        </button>
      </div>
       {/* Daily Quote Section */}
       <div className="bg-gray-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-bold text-gray-700 italic">"{getDailyQuote()}"</p>
        </div>
      </div>
      <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
        {showSendOtpButton && (
          <form onSubmit={handleSendOtp}>
            <h2 className="text-2xl font-bold mb-4">Send OTP</h2>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email:
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Send OTP
            </button>
          </form>
        )}
        {showVerifyButton && (
          <form onSubmit={handleVerifyOtp}>
          <p>Enter the OTP sent to your email:</p>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            pattern="[0-9]{6}"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Verify OTP
          </button>
        </form>
        )}
        {showNewPasswordForm && (
          <form onSubmit={handleResetPassword}>
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password:
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              required
            />
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password:
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Reset Password
            </button>
          </form>
        )}
        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
      <footer className="bg-white shadow-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Bengaluru Roads. All Rights Reserved.
            </p>
          </div>
        </footer>
    </div>
    
  );
};

export default SendOtp;
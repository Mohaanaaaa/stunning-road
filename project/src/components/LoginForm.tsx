import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logger from './logger'; // Import the logger utility

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberState = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail && rememberState) {
      setEmail(savedEmail);
      setRememberMe(true);
      logger.info('Loaded saved email and remember state', { savedEmail, rememberState });
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setEmailCheckLoading(true);
    setError('');

    logger.info('Validating email', { email: inputEmail });

    if (validateEmail(inputEmail)) {
      try {
        const response = await axios.post('http://localhost:5000/api/verify-email', { email: inputEmail });
        setIsEmailValid(response.data.success);
        logger.info('Email validation response received', { email: inputEmail, success: response.data.success });
      } catch (err: any) {
        setIsEmailValid(false);
        setError(err.response?.data?.message || 'Email verification failed');
        console.log('Email validation failed')
        logger.error('Email validation failed', err.response || err);
      } finally {
        setEmailCheckLoading(false);
      }
    } else {
      setIsEmailValid(false);
      setError('Invalid email format');
      setEmailCheckLoading(false);
      logger.warn('Invalid email format detected', { email: inputEmail });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    logger.info('Login attempt started', { email, rememberMe });

    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.data.message === 'Login successful') {
        logger.info('Login successful', { email });

        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
          localStorage.setItem('rememberMe', 'true');
          logger.info('Saved credentials to local storage', { email });
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
          localStorage.removeItem('rememberMe');
          logger.info('Cleared saved credentials from local storage');
        }
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      logger.error('Login failed', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="mb-4 relative">
          <label htmlFor="email" className="block text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            className={`w-full border rounded px-3 py-2 transition-all duration-300 ${isEmailValid ? 'border-green-600' : ''}`}
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            required
          />
          {isEmailValid && !emailCheckLoading && (
            <span className="absolute right-3 top-8 text-green-600">✔️</span>
          )}
          {emailCheckLoading && (
            <span className="absolute right-3 top-8 text-gray-500 animate-spin">🔄</span>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm text-blue-600">
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="mb-4 flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="mr-2"
          />
          <label htmlFor="rememberMe" className="text-gray-700">Remember Me</label>
        </div>
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading || !isEmailValid}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center flex justify-between">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
        <a href="/reset-password" className="text-sm text-green-600 hover:underline">Reset Password</a>
      </div>
    </div>
  );
};

export default Login;

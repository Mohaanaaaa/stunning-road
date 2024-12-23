import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation();

  // Get email from state passed during navigation
  const email = location.state?.email;

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Only send OTP for verification
      const response = await axios.post('http://localhost:5000/verify-otp', { otp });
      setMessage(response.data.message);

      // Redirect to the reset password page after successful OTP verification
      navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error verifying OTP');
    }
  };

  return (
    <form onSubmit={handleVerifyOtp} className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
        OTP:
      </label>
      <input
        id="otp"
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
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
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </form>
  );
};

export default VerifyOtp;
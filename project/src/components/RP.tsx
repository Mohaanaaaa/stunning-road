import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isOldPasswordVerified, setIsOldPasswordVerified] = useState(false);

  const handleOldPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/verify-old-password', { oldPassword });
      if (response.data.verified) {
        setIsOldPasswordVerified(true);
        setMessage('Old password verified. Please enter a new password.');
      } else {
        setError('Old password is incorrect.');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'An error occurred. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/reset-password', { newPassword });
      setMessage(response.data.message || 'Password has been reset successfully.');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'An error occurred. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      {!isOldPasswordVerified ? (
        <form onSubmit={handleOldPasswordSubmit}>
          <div className="mb-4">
            <label htmlFor="oldPassword" className="block text-gray-700">
              Old Password
            </label>
            <input
              id="oldPassword"
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter your old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Verify Old Password
          </button>
        </form>
      ) : (
        <form onSubmit={handleNewPasswordSubmit}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-gray-700">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>
      )}
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

export default ResetPassword;
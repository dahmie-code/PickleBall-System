import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import './ForgotPassword.css';
import { auth } from '../firebase/Firebase.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (error) {
      setResetSent(false);
      setError('Error sending password reset email. Please check your email and try again.');
      console.error('Error sending password reset email:', error);
    }
  };

  return (
    <div className="forgot-password-container">
      <form>
        <h2>Forgot Password</h2>
        {resetSent ? (
          <p>Password reset email sent. Check your inbox.</p>
        ) : (
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={handleResetPassword}
              className="reset-button"
            >
              Reset Password
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        )}
        <p>
          <Link to="/">Back to Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;

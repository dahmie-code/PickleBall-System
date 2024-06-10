import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/Firebase.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showLoginButton, setShowLoginButton] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch stored token and location state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setEmail(storedToken);
    }
    if (location.state && location.state.message) {
      setInfoMessage(location.state.message);
    }
  }, [location]);

  // Handle user login
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        setShowLoginButton(false);
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-login-credentials':
          setError('The email and password entered do not match an account.');
          break;
        case 'auth/user-not-found':
          setError('User not found. Please check your email or sign up.');
          break;
        default:
          setError('Login failed. Please try again.');
          break;
      }
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      setInfoMessage('The email verification has been resent to your email. Please verify your account.');
      setTimeout(() => {
        setInfoMessage('');
        window.location.reload();
      }, 5000);
    } catch (error) {
      setError('Error sending verification email. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Sign in</h1>
      {infoMessage && <p className="info">{infoMessage}</p>}
      {error && <p className="error">{error}</p>}
      <form>
        <label>
          Email:<br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-cypress-name="login-email-input"
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-cypress-name="password-email-input"
            required
          />
        </label>
        {showLoginButton && (
          <button data-cypress-name="login-form-submit-button" type="button" onClick={handleLogin}>
            Sign In
          </button>
        )}
        {error === 'Please verify your email before logging in.' && !showLoginButton && (
          <button type="button" onClick={() => resendVerificationEmail(auth.currentUser)}>
            Resend Verification Email
          </button>
        )}
        <p className="forgot-password">
          <Link to="/forgotpassword">Forgot Password?</Link>
        </p>
        <p>
          Don&#39;t have an account? <Link data-cypress-name="signup-link" to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
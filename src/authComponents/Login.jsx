import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/Firebase.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [verificationSent, setVerificationSent] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setEmail(storedToken);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        setShowLoginButton(false);
        setVerificationSent(false);
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/invalid-login-credentials') {
        setError("The email and password entered does not match an account");
      } else if (error.code === 'auth/user-not-found') {
        setError('User not found. Please check your email or sign up.');
        console.log(error.code)
      } else {
        setError('Login failed. Please try again.');
        console.log(error.code)
      }
    }
  };

  const resendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setError('Error sending verification email. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Sign in</h1>
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
          <button onClick={() => resendVerificationEmail(auth.currentUser)}>
            Resend Verification Email
          </button>
        )}
        <p className="forgot-password">
          <Link to="/forgotpassword">Forgot Password?</Link>
        </p>
        <p>
          Don't have an account? <Link data-cypress-name={"signup-link"} to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

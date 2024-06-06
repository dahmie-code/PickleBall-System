import React from 'react';
import { Link } from 'react-router-dom';

const RegistrationSuccess = () => {
  return (
    <div>
      <p>You have signed up successfully. Please check your email to verify your account.</p>
      <Link to="/">Click here to Login</Link>
    </div>
  );
};

export default RegistrationSuccess;
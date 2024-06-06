import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { sendEmailVerification } from 'firebase/auth';
import { createUser } from '../firebase/firebaseFunctions';
import { ref, set, db } from '../firebase/Firebase.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import './Signup.css';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmail = () => {
    if (!isEmailValid(email)) {
      setEmailError('Invalid email format.');
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!isPasswordValid(password)) {
      setPasswordError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least six characters long.'
      );
      return false;
    }
    return true;
  };

  const validatePhoneNumber = () => {
    const phoneRegex = /^[0-9()+\-]{0,20}$/; // Regex to allow only numeric values and characters (),+,- with a maximum length of 20 characters
    if (!phoneRegex.test(phone)) {
      setPhoneError('Phone number should only contain numeric values, max 20 characters and non-numeric characters (),+,-');
      return false;
    }
    setPhoneError(''); // Clear phone number error if it's valid
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError(''); 
    setPhoneError('');

    if (!validatePhoneNumber()) {
      return;
    }
    
    if (!validateEmail() || email !== confirmEmail) {
      setEmailError('Email and Confirm Email must match.');
      return;
    } else {
      if (!validatePassword() || password !== confirmPassword) {
        setPasswordError('Password and Confirm Password must match.');
        return;
      }
    }

    try {
      const authUser = await createUser(email, password, {
        displayName: `${firstName} ${lastName}`,
      });

      const formattedBirthdate = birthdate.toISOString().slice(0, 10);
      const userRef = ref(db, `/players/${authUser.uid}`);
      await set(userRef, {
        name: `${firstName} ${lastName}`,
        email: authUser.email,
        id: authUser.uid,
        dateOfBirth: formattedBirthdate,
        gender: gender,
        location: {
          city: selectedCity ? selectedCity.name : '',
          country: selectedCountry ? selectedCountry.isoCode : '',
          state: selectedState ? selectedState.isoCode : '',
        },
        rating: {
          doubles: 2,
          singles: 2,
        }
      });
      await sendEmailVerification(authUser);
      navigate('/login', { state: { message: 'A verification email has been sent. Please verify your account.' } });
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const countryList = Country.getAllCountries();
    setCountries(countryList);
  }, []);

  const handleCountryChange = (item) => {
    setSelectedCountry(item);
    const statesOfCountry = State.getStatesOfCountry(item.isoCode);
    setStates(statesOfCountry);
    setSelectedState(null);
    setSelectedCity(null);
    setCities([]);
  };

  const handleStateChange = (item) => {
    setSelectedState(item);
    const citiesOfState = City.getCitiesOfState(
      item.countryCode,
      item.isoCode
    );
    setCities(citiesOfState);
    setSelectedCity(null);
  };

  const today = new Date();
  today.setFullYear(today.getFullYear() - 13);

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
  };

  return (
    <div className="signup-container">
      <h1 data-cypress-name={"signup-title"}>Sign up</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="row">
          <div className="col">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              data-cypress-name={"first-name-signup"}
              required
            />
          </div>
          <div className="col">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              data-cypress-name={"last-name-signup"}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col" data-cypress-name={"birthdate-signup"}>
            <DatePicker
              placeholderText="Birthdate"
              selected={birthdate}
              onChange={(date) => setBirthdate(date)}
              dateFormat="yyyy/MM/dd"
              maxDate={today}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              required
            />
          </div>
          <div className="col">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              data-cypress-name={"gender-signup"}
              required>
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col">
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              data-cypress-name={"phone-number-signup"}
              required
            />
            {phoneError && (
              <p className="error">{phoneError}</p>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col"
            data-cypress-name={"country-signup"}>
            <Select
              options={countries}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              value={selectedCountry}
              onChange={handleCountryChange}
              placeholder="Country"


              required
            />
          </div>
          <div className="col"
            data-cypress-name={"state-signup"}
          >
            <Select
              options={states}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              value={selectedState}
              onChange={handleStateChange}
              placeholder="State/Province"
              isDisabled={!selectedCountry}
            />
          </div>
          <div className="col"
            data-cypress-name={"city-signup"}
          >
            <Select
              options={cities}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              value={selectedCity}
              onChange={(item) => setSelectedCity(item)}
              placeholder="City"
              isDisabled={!selectedState}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-cypress-name={"email-signup"}

              required
            />
          </div>
          <div className="col">
            <input
              type="email"
              placeholder="Confirm Email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
              onPaste={(e) => e.preventDefault()}
              data-cypress-name={"confirm-email-signup"}

            />
            {emailError && (
              <p className="error">{emailError}</p>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              data-cypress-name={"password-signup"}

              required
            />
            {passwordTouched && !isPasswordValid(password) && (
              <p className="error">
                Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least six characters long.
              </p>
            )}
          </div>
          <div className="col">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              onPaste={(e) => e.preventDefault()}
              data-cypress-name={"confirm-password-signup"}

            />
            {passwordError && (
              <p className="error">{passwordError}</p>
            )}
          </div>
        </div>
        <button
          data-cypress-name={"submit-button-signup"}
          type="submit">Sign Up</button>
        <p >
          Already have an account? <Link data-cypress-name={"sign-in-link-signup"} to="/">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup
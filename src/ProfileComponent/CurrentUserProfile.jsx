import { useState, useEffect } from "react";
import { calculateUserAge } from "../firebase/firebaseFunctions";
import Sidebar from '../sidebarComponent/Sidebar';
import { auth } from "../firebase/Firebase";
import { updatePassword } from 'firebase/auth';
import UserProfileData from "./UserProfileData";
import { getUser, updateUser } from "../firebase/firebaseFunctions";
import { useNavigate } from 'react-router-dom';
import { Country, State, City } from "country-state-city";
import { Form, CustomSelect, MainContainer, ProfileInfoContainer, InputContainer, Input, InfoRow, Label, Data, FormRow, buttonContainer, button, Container, UserProfileContainer, UserProfilePerformance, Rating, RatingContainer, RatingSingles, RatingDoubles } from "./ProfileStyles";

  const CurrentUserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(auth.currentUser);
    const { userData } = UserProfileData(user?.uid);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
    const [changePasswordSuccessMessage, setChangePasswordSuccessMessage] = useState('');
    const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      });
      return () => {
        unsubscribe();
      };
    }, []);   

    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const [editMode, setEditMode] = useState(false);
    const [location, setLocation] = useState({
      city: userData?.location?.city || '',
      state: userData?.location?.state || '',
      country: userData?.location?.country || '',
    });
    const [name, setName] = useState (userData?.name || '');
  
    const handleNameChange = (e) => {
      const { value } = e.target;
      setName(value);
    };
    
    const fetchUserDataForEdit = async (userId) => {
      try {
        const userDataFromFirebase = await getUser(userId);
        setName(userDataFromFirebase?.name || '');
        setLocation({
          city: userDataFromFirebase?.location?.city || '',
          state: userDataFromFirebase?.location?.state || '',
          country: userDataFromFirebase?.location?.country || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    // Function to handle entering edit mode
    const handleEditMode = () => {
      setEditMode(true);
      fetchUserDataForEdit(user.uid);
    };
  
    // Function to Handle location changes
    const handleCountryChange = (selectedCountry) => {
      setLocation({
        country: selectedCountry,
        state: '',
        city: '',
      });
    };
    
    // Function to handle state change
    const handleStateChange = (selectedState) => {
      setLocation({
        ...location,
        state: selectedState,
        city: '',
      });
    };
    
    // Function to handle city change
    const handleCityChange = (selectedCity) => {
      setLocation({
        ...location,
        city: selectedCity,
      });
    };

    const isPasswordValid = (newPassword) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
      return passwordRegex.test(newPassword);
    };

    const handleShowChangePasswordForm = () => {
      setShowChangePasswordForm(true);
    };

    const handlePasswordChange = async (e) => {
      setPasswordError('');
      try {
        if (newPassword !== confirmPassword) {
          setPasswordError('Password and Confirm Password must match.');
          return;
        }

        await updatePassword(user, newPassword);
        setPasswordChangeSuccess(true);
        setChangePasswordSuccessMessage('Password changed successfully. Please log in again.');
        
        // Sign out after password change
        setTimeout(() => {
          auth.signOut().then(() => {
            navigate('/');
          }).catch((error) => {
            console.error('Error signing out after password change:', error);
          });
        }, 3000);
      } catch (error) {
        console.error("Error updating password:", error);
      }
    };


    // Function to handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const updatedUserData = {
          ...userData,
          name: name,
          location: location
        };
        await updateUser(user.uid, updatedUserData);
        setEditMode(false);
        window.location.reload();
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    };

    const handleCancel = () => {
      setEditMode(false);
    };

    return (
        <MainContainer>
          <Sidebar style={{ height: '90vh' }}  /> 
            <Container>
                <UserProfileContainer>
                  <div>
                    <h2>{userData?.name || "Unknown User"}</h2>
                    <p>
                      {userData?.location.state && userData?.location.city ? (
                        `${userData?.location.city}, ${userData?.location.state}, ${userData?.location.country}`
                      ) : (
                        userData?.location.country || 'Unknown'
                      )} {' | '}
                      {userData?.gender ? (
                        <span>
                          {userData?.gender.toLowerCase() === 'male' ? 'M' :
                            userData?.gender.toLowerCase() === 'female' ? 'F' : 'Other'}
                        </span>
                      ) : ''} {' | '}
                      {calculateUserAge(userData?.dateOfBirth)}
                    </p>
                  </div>

                  <UserProfilePerformance>
                    <Rating>
                      <RatingContainer>
                        <div> 
                          <RatingSingles /> Singles                   
                        </div> 
                        {userData?.rating?.singles.toFixed(3)  || "NR"}                   
                      </RatingContainer>
                      <RatingContainer>
                        <div>
                          <RatingDoubles/> Doubles                         
                        </div>
                        {userData?.rating?.doubles.toFixed(3)  || "NR"}                 
                      </RatingContainer>
                    </Rating>                          
                  </UserProfilePerformance>

                  {showChangePasswordForm ? (
                    <Form style={{padding: '0px 50px 20px'}}>
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', marginBottom: '10px', backgroundColor: '#E0E0E0', borderRadius: '5px' }}>
                          <h3 style={{ margin: '5px', textAlign: 'center' }}>Change Your Password</h3>
                          <button style={{width: '75px', fontSize: '16px', marginTop: '0px', backgroundColor: '#E0E0E0', color: '#004C99'}} onClick={() => setShowChangePasswordForm(false)}>Cancel</button>
                        </div>
                        <h5>Your password must:</h5>
                        <p>1. Contain between 6 - 20 characters</p>
                        <p>2. Include at least one uppercase letter</p>
                        <p>3. Include at least one lowercase letter</p>
                        <p>4. Include at least one number</p>
                        <p>5. Include at least one of the following allowable special characters: @, $, !, %, *, ?, and &</p>
                          <div className="col">
                            <input
                              type="password"
                              placeholder="Current Password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              required
                            />
                          </div>
                          <div className="col">
                            <input
                              type="password"
                              placeholder="New Password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                            {!isPasswordValid(newPassword) && (
                              <p className="error">
                                Please ensure your password meets all requirements.
                              </p>
                            )}
                          </div>
                          <div className="col">
                            <input
                              type="password"
                              placeholder="Confirm New Password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              onPaste={(e) => e.preventDefault()}
                            />
                            {passwordError && (
                              <p>{passwordError}</p>
                            )}
                          </div>
                          {changePasswordSuccessMessage}
                          <div style={buttonContainer}>
                          <button style={{width: '200px'}} type="button" onClick={handlePasswordChange}>
                            Reset Password
                          </button>
                          </div>
                      </div>
                    </Form>
                    ) : editMode ? (
                      <Form onSubmit={handleSubmit}>
                        <h2 style={{ textAlign: 'center', marginBottom: '10px', backgroundColor: '#E0E0E0', borderRadius: '5px' }}>Change Your Info</h2>
                        <FormRow>
                          <Label> Name: </Label>
                            <InputContainer>
                              <Input
                                type="text"
                                name="name"
                                value={name}
                                onChange={handleNameChange}
                                required
                              />
                            </InputContainer>
                        </FormRow>

                        <FormRow>
                          <Label>Country: </Label>
                          <div>
                            <InputContainer>
                              <CustomSelect
                                value={location.country || ""}
                                onChange={(e) => handleCountryChange(e.target.value)}
                                required
                              >
                                <option value="">Select Country</option>
                                {Country.getAllCountries().map((country) => (
                                  <option key={country.isoCode} value={country.isoCode}>
                                    {country.name}
                                  </option>
                                ))}
                              </CustomSelect>
                            </InputContainer>
                          </div>
                        </FormRow>

                        <FormRow>
                          <Label>State: </Label>
                          <div>
                            <InputContainer>
                              <CustomSelect
                                value={location.state || ""}
                                onChange={(e) => handleStateChange(e.target.value)}
                                disabled={!location.country}
                              >
                                <option value="">Select State</option>
                                {State.getStatesOfCountry(location.country)?.map((state) => (
                                  <option key={state.isoCode} value={state.isoCode}>
                                    {state.name}, {state.isoCode}
                                  </option>
                                ))}
                              </CustomSelect>
                            </InputContainer>
                          </div>
                        </FormRow>
                      
                        <FormRow>
                          <Label>City: </Label>
                          <div>
                            <InputContainer>
                              <CustomSelect
                                value={location.city || ""}
                                onChange={(e) => handleCityChange(e.target.value)} 
                                disabled={!location.state} 
                              >
                                <option value="">Select City</option>
                                {City.getCitiesOfState(location.country, location.state)?.map((city) => (
                                  <option key={city.name} value={city.name}>
                                    {city.name}
                                  </option>
                                ))}
                              </CustomSelect>
                            </InputContainer>
                          </div>
                        </FormRow>
                      
                        <FormRow>
                          <Label>Birthday:</Label>
                          <Data>{userData?.dateOfBirth || 'Unknown'}</Data>
                        </FormRow>
                        <FormRow>
                          <Label>Gender:</Label>
                          <Data>{userData?.gender ? capitalizeFirstLetter(userData.gender) : 'Unknown'}</Data>
                        </FormRow>
                        <FormRow>
                          <Label>Password:</Label>
                          <Data style={{color: 'blue', cursor: 'pointer'}} type="button" onClick={handleShowChangePasswordForm}>Change Your Password </Data>
                        </FormRow>
                    
                        <div style={buttonContainer}>
                          <button style={button} type="submit">Save</button>
                          <button style={button} type="button" onClick={handleCancel}>Cancel</button>
                        </div>
                      </Form>
                    ) : (
                      <Form>
                        <ProfileInfoContainer>
                          <InfoRow>
                            <Label>Name:</Label>
                            <Data>{userData?.name || 'Unknown'}</Data>
                          </InfoRow>
                          <InfoRow>
                            <Label>Location:</Label>
                            <Data>
                            {userData?.location.state && userData?.location.city ? (
                              `${userData?.location.city}, ${userData?.location.state}, ${userData?.location.country}`
                            ) : (
                              userData?.location.country || 'Unknown'
                            )}
                            </Data>
                          </InfoRow>
                          <InfoRow>
                            <Label>Birthday:</Label>
                            <Data>{userData?.dateOfBirth || 'Unknown'}</Data>
                          </InfoRow>
                          <InfoRow>
                            <Label>Gender:</Label>
                            <Data>{userData?.gender ? capitalizeFirstLetter(userData.gender) : 'Unknown'}</Data>
                          </InfoRow>
                        </ProfileInfoContainer>

                        {!editMode && (
                          <button onClick={handleEditMode}>Edit</button>
                        )}
                      </Form>
                    )}
                </UserProfileContainer>
            </Container>            
        </MainContainer>
    );
};

export default CurrentUserProfile;







//     // Function to handle form submission
//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       setPasswordError('');

//       if (newPassword !== confirmPassword) {
//         setPasswordError('Password and Confirm Password must match.');
//         return;
//       }
    
//       try {
//         const updatedUserData = {
//           ...userData,
//           name: name,
//           location: location
//         };
//         await updateUser(user.uid, updatedUserData);
//         // setEditMode(false);

//         await updatePassword(user, newPassword);
//         setPasswordChangeSuccess(true);
//         setChangePasswordSuccessMessage('Information changed successfully. Please log in again.');
        
//         // Sign out after password change
//         setTimeout(() => {
//           auth.signOut().then(() => {
//             navigate('/');
//           }).catch((error) => {
//             console.error('Error signing out after password change:', error);
//           });
//         }, 3000);
//       } catch (error) {
//         console.error("Error updating user data:", error);
//       }
//     };

//     const handleCancel = () => {
//       setEditMode(false);
//     };

//     return (
//         <MainContainer>
//           <Sidebar /> 
//             <Container>
//                 <UserProfileContainer>
//                   <div>
//                     <h2>{userData?.name || "Unknown User"}</h2>
//                     <p>
//                       {userData?.location.state && userData?.location.city ? (
//                         `${userData?.location.city}, ${userData?.location.state}, ${userData?.location.country}`
//                       ) : (
//                         userData?.location.country || 'Unknown'
//                       )} {' | '}
//                       <span>
//                         {userData?.gender === "female"
//                           ? "F"
//                           : userData?.gender === "male"
//                           ? "M"
//                           : ""}
//                       </span>{" "}
//                       | {calculateUserAge(userData?.dateOfBirth)}
//                     </p>
//                   </div>

//                   <UserProfilePerformance>
//                     <Rating>
//                       <RatingContainer>
//                         <div> 
//                           <RatingSingles /> Singles                   
//                         </div>
//                         {userData?.rating?.singles.toFixed(3)  || "NR"}                   
//                       </RatingContainer>
//                       <RatingContainer>
//                         <div>
//                           <RatingDoubles/> Doubles                         
//                         </div>
//                         {userData?.rating?.doubles.toFixed(3)  || "NR"}                 
//                       </RatingContainer>
//                     </Rating>                          
//                   </UserProfilePerformance>

//                   {editMode ? (
//                     // Render form in edit mode
//                     <Form onSubmit={handleSubmit}>
//                       <h2 style={{ marginBottom: '10px' }}>Change Your Info</h2>
//                       <FormRow>
//                         <Label> Name: </Label>
//                           <InputContainer>
//                             <Input
//                               type="text"
//                               name="name"
//                               value={name}
//                               onChange={handleNameChange}
//                               required
//                             />
//                           </InputContainer>
//                       </FormRow>

//                       <FormRow>
//                         <Label>Country: </Label>
//                         <div>
//                           <InputContainer>
//                             <CustomSelect
//                               value={location.country || ""}
//                               onChange={(e) => handleCountryChange(e.target.value)}
//                               required
//                             >
//                               <option value="">Select Country</option>
//                               {Country.getAllCountries().map((country) => (
//                                 <option key={country.isoCode} value={country.isoCode}>
//                                   {country.name}
//                                 </option>
//                               ))}
//                             </CustomSelect>
//                           </InputContainer>
//                         </div>
//                       </FormRow>

//                       <FormRow>
//                         <Label>State: </Label>
//                         <div>
//                           <InputContainer>
//                             <CustomSelect
//                               value={location.state || ""}
//                               onChange={(e) => handleStateChange(e.target.value)}
//                               disabled={!location.country}
//                             >
//                               <option value="">Select State</option>
//                               {State.getStatesOfCountry(location.country)?.map((state) => (
//                                 <option key={state.isoCode} value={state.isoCode}>
//                                   {state.name}, {state.isoCode}
//                                 </option>
//                               ))}
//                             </CustomSelect>
//                           </InputContainer>
//                         </div>
//                       </FormRow>
                    
//                       <FormRow>
//                         <Label>City: </Label>
//                         <div>
//                           <InputContainer>
//                             <CustomSelect
//                               value={location.city || ""}
//                               onChange={(e) => handleCityChange(e.target.value)} 
//                               disabled={!location.state} 
//                             >
//                               <option value="">Select City</option>
//                               {City.getCitiesOfState(location.country, location.state)?.map((city) => (
//                                 <option key={city.name} value={city.name}>
//                                   {city.name}
//                                 </option>
//                               ))}
//                             </CustomSelect>
//                           </InputContainer>
//                         </div>
//                       </FormRow>
                    
//                       <FormRow>
//                         <Label>Birthday:</Label>
//                         <Data>{userData?.dateOfBirth || 'Unknown'}</Data>
//                       </FormRow>
//                       <FormRow>
//                         <Label>Gender:</Label>
//                         <Data>{userData?.gender ? capitalizeFirstLetter(userData.gender) : 'Unknown'}</Data>
//                       </FormRow>

//                       <h2 style={{ marginBottom: '10px' }}>Change Your Password</h2>
//                       <h5>Your password must:</h5>
//                       <p>1. Contain between 6 - 20 characters</p>
//                       <p>2. Include at least one uppercase letter</p>
//                       <p>3. Include at least one lowercase letter</p>
//                       <p>4. Include at least one number</p>
//                       <p>5. Include at least one of the following allowable special characters: @, $, !, %, *, ?, and &</p>
//                       <div className="row">
//                         <div className="col">
//                           <input
//                             type="password"
//                             placeholder="Current Password"
//                             value={currentPassword}
//                             onChange={(e) => setCurrentPassword(e.target.value)}
//                             required
//                           />
//                         </div>
//                         <div className="col">
//                           <input
//                             type="password"
//                             placeholder="New Password"
//                             value={newPassword}
//                             onChange={(e) => setNewPassword(e.target.value)}
//                             required
//                           />
//                           {!isPasswordValid(newPassword) && (
//                             <p className="error">
//                               Please ensure your password meets all requirements.
//                             </p>
//                           )}
//                         </div>
//                         <div className="col">
//                           <input
//                             type="password"
//                             placeholder="Confirm New Password"
//                             value={confirmPassword}
//                             onChange={(e) => setConfirmPassword(e.target.value)}
//                             required
//                             onPaste={(e) => e.preventDefault()}
//                           />
//                           {passwordError && (
//                             <p>{passwordError}</p>
//                           )}
//                         </div>
//                       </div>
//                       {changePasswordSuccessMessage}
//                       <div style={buttonContainer}>
//                         <button style={button} type="submit">Save</button>
//                         <button style={button} type="button" onClick={handleCancel}>Cancel</button>
//                       </div>
//                     </Form>
//                   ) : (
//                     <Form>
//                       <ProfileInfoContainer>
//                         <InfoRow>
//                           <Label>Name:</Label>
//                           <Data>{userData?.name || 'Unknown'}</Data>
//                         </InfoRow>
//                         <InfoRow>
//                           <Label>Location:</Label>
//                           <Data>
//                           {userData?.location.state && userData?.location.city ? (
//                             `${userData?.location.city}, ${userData?.location.state}, ${userData?.location.country}`
//                           ) : (
//                             userData?.location.country || 'Unknown'
//                           )}
//                           </Data>
//                         </InfoRow>
//                         <InfoRow>
//                           <Label>Birthday:</Label>
//                           <Data>{userData?.dateOfBirth || 'Unknown'}</Data>
//                         </InfoRow>
//                         <InfoRow>
//                           <Label>Gender:</Label>
//                           <Data>{userData?.gender ? capitalizeFirstLetter(userData.gender) : 'Unknown'}</Data>
//                         </InfoRow>
//                       </ProfileInfoContainer>

//                       {!editMode && (
//                         <button onClick={handleEditMode}>Edit</button>
//                       )}
//                     </Form>
//                   )}
//                 </UserProfileContainer>
//             </Container>            
//         </MainContainer>
//     );
// };

// export default CurrentUserProfile;

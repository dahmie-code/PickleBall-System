import { useState, useEffect } from "react";
import { Route, Routes} from "react-router-dom";
import { Country, State, City } from "country-state-city";
import Sidebar from "../sidebarComponent/Sidebar";
import ClubDetails from "./ClubDetails";
import ClubCard from "./ClubCard";
import {
  ClubGrid,
  ClubListContainer,
  ModalContainer,
  ModalContent,
  CloseIcon,
  ModalForm,
} from "./ClubListStyles";
import { getAuth } from "firebase/auth";
import {
  getAllClubs,
  joinClub,
  leaveClub,
  getUser,
  createClub,
} from "../firebase/firebaseFunctions";

const ClubList = () => {
  // const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [addClubMessage, setAddClubMessage] = useState(false);
  const [isCountrySelected, setIsCountrySelected] = useState(true);
  const [user, setUser] = useState(null);  const [isOrganizerInputVisible, setIsOrganizerInputVisible] = useState(false);
  const [isStateSelected, setIsStateSelected] = useState(true);
  const [newClubData, setNewClubData] = useState({
    name: "",
    location: {
      country: "",
      state: "",
      city: "",
    },
    contactInfo: {
      email: "",
      phone: "",
    },
    organizers: [],
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    country: "",
    state:"",
    city: "",
    email: "",
    phone: "",
    organizerEmail: "",
  });

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser); 
    }

    const fetchClubs = async () => {
      try {
        const clubsData = await getAllClubs();

        if (typeof clubsData === "object") {
          const clubsArray = Object.values(clubsData);
          setClubs(clubsArray);
        } else if (Array.isArray(clubsData)) {
          setClubs(clubsData);
        } else {
          console.error("Fetched data is not an array or object:", clubsData);
        }
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };

    fetchClubs();
  }, []);

  const updateMembershipStatus = (clubId, isMember) => {
    const storedMemberships =
      JSON.parse(localStorage.getItem("clubMemberships")) || {};
    storedMemberships[clubId] = isMember;
    localStorage.setItem("clubMemberships", JSON.stringify(storedMemberships));
  };

  useEffect(() => {
    const storedMemberships =
      JSON.parse(localStorage.getItem("clubMemberships")) || {};
    setClubs((prevClubs) => {
      return prevClubs.map((club) => {
        return {
          ...club,
          isMember: storedMemberships[club.id] || false,
        };
      });
    });
  }, [setClubs]);

  const handleToggleMembership = async (clubId, isMember) => {
    try {
      const user = getAuth().currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      if (user) {
        const userId = user.uid;
        // Fetch user details from the database
        const userDetails = await getUser(userId);

        if (!userDetails) {
          console.error("User details not found");
          return;
        }

        const { name: userName, rating: userRating } = userDetails;

        if (isMember) {
          await leaveClub(clubId, userId);
        } else {
          await joinClub(clubId, userId, userName, userRating);
        }

        setClubs((prevClubs) =>
          prevClubs.map((club) => {
            if (club.id === clubId) {
              const updatedClub = { ...club, isMember: !isMember };
              updateMembershipStatus(clubId, updatedClub.isMember);
              return updatedClub;
            }
            return club;
          })
        );
        console.log(`User ${isMember ? 'left' : 'joined'} club with ID: ${clubId}`);
      } else {
        console.error("User not authenticated");
      }
    } catch (error) {
      console.error("Error toggling membership:", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.error("Form validation failed");
      return;
    }


    try {
      const user = getAuth().currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const uniqueOrganizerEmails = [...new Set(newClubData.organizers.map(organizer => organizer.email))];

        const newClubDataWithIds = {
          ...newClubData,
          organizers: uniqueOrganizerEmails,
        };
      const { country, state, city } = newClubDataWithIds.location;

      const result = await createClub({
        ...newClubDataWithIds,
        location: {
          country,
          state,
          city,
        },
      });

      if (result.success) {
        setIsSuccess(true);
        setAddClubMessage(result.message);
        setTimeout(() => {
          setIsModalOpen(false);
          setNewClubData({
            name: "",
            location: {
              country: "",
              state: "",
              city: "",
            },
            contactInfo: {
              email: "",
              phone: "",
            },
            organizers: [],
          });
          setIsSuccess(false);
        }, 3000);
        console.log(`Club with ID ${result.message} created successfully`);
      } else {
        // Update formErrors with the error message received from createClub function
        setFormErrors({ ...formErrors, general: result.message });
      }
    } catch (error) {
      console.error("Error creating club:", error.message);
    }
  };
  const handleAddOrganizer = async () => {
    try {
      const user = getAuth().currentUser;
  
      if (!user) {
        console.error("User not authenticated");
        return;
      }
  
      // Fetch user details from the database
      const userDetails = await getUser(user.uid);
  
      if (!userDetails) {
        console.error("User details not found");
        return;
      }
  
      setIsOrganizerInputVisible(true);
  
      setNewClubData((prevData) => ({
        ...prevData,
        organizers: [
          ...prevData.organizers,
          {
            id: user.uid,
          },
        ],
      }));
    } catch (error) {
      console.error("Error adding organizer:", error);
    }
  };
  
  const validateForm = () => {
    const errors = {
      name: "",
      country: "",
      state: "",
      city: "",
      email: "",
      phone: "",
      organizerEmail: "",
    };

    // Validate club name
    if (!newClubData.name?.trim()) {
      errors.name = "Club name is required";
    }

    // Validate country
    if (!newClubData.location.country?.trim()) {
      errors.country = "Country is required";
    }

    // Validate state
    if (!newClubData.location.state?.trim()) {
      errors.state = "State is required";
    }
    // Validate city
    if (!newClubData.location.city?.trim()) {
      errors.city = "City is required";
    }

    // Validate club email
    if (!newClubData.contactInfo.email?.trim()) {
      errors.email = "Club email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
        newClubData.contactInfo.email
      )
    ) {
      errors.email = "Invalid email address";
    }

    // Validate club phone number
    if (!newClubData.contactInfo.phone?.trim()) {
      errors.phone = "Club phone number is required";
    } else if (!/^\d{10}$/.test(newClubData.contactInfo.phone.trim())) {
      errors.phone = "Phone number must be 10 digits";
    }

    // Validate organizers
// Validate organizers
newClubData.organizers.forEach((organizer) => {
  console.log('Validating email:', organizer.email);
  if (!organizer.email?.trim()) {
    errors.organizerEmail = "Organizer email is required";
  } else if (!/\S+@\S+\.\S+/.test(organizer.email)) {
    errors.organizerEmail = "Invalid email address";
  } else {
    console.log('Email is valid!');
  }
});


    setFormErrors(errors);

    // If there are no errors, the form is valid
    return Object.values(errors).every((error) => error === "");
  };

  const filteredClubs = clubs.filter((club) => {
    return club.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <ClubListContainer>
      <Sidebar />
      <div className="clubLists__wrapper">
        <h1>Clubs</h1>
        <input
          className="club__input"
          type="text"
          placeholder="Search for a club..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Button to open the modal */}
        <button
          className="create-club-button"
          onClick={() => setIsModalOpen(true)}
        >
          Create Club
        </button>
        <h3>Explore Clubs</h3>
        <Routes>
          {filteredClubs.map((club) => (
            <Route
              key={club.id}
              path={`/club/${club.id}`}
              element={<ClubDetails />}
            />
          ))}
        </Routes>
        <ClubGrid>
          <div className="club-list">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onToggleMembership={() =>
                  handleToggleMembership(club.id, club.isMember)
                }
              />
            ))}
          </div>
        </ClubGrid>
      </div>
      {/* Modal for creating a new club */}
      {isModalOpen && (
        <ModalContainer>
          <ModalContent>
            <h2>Create a new Club</h2>
            <CloseIcon onClick={() => setIsModalOpen(false)} />
            <ModalForm onSubmit={handleFormSubmit}>
              <div className="form__container">
                <div className="row">
                  <div className="column">
                    <div className="form__input">
                      <label>
                        Club Name:
                        <input
                          type="text"
                          value={newClubData.name}
                          onChange={(e) =>
                            setNewClubData({ ...newClubData, name: e.target.value })
                          }
                        />
                        <span className="error-message">{formErrors.name}</span>
                      </label>
                    </div>
                  </div>

                  <div className="column">
                    <div className="form__input">
                      <label>
                        Club Email:
                        <input
                          type="email"
                          value={newClubData.contactInfo.email}
                          onChange={(e) =>
                            setNewClubData({
                              ...newClubData,
                              contactInfo: {
                                ...newClubData.contactInfo,
                                email: e.target.value,
                              },
                            })
                          }
                        />
                        <span className="error-message">{formErrors.email}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="column">
                    <div className="form__input">
                      <label>
                        Club Phone:
                        <input
                          type="tel"
                          value={newClubData.contactInfo.phone}
                          onChange={(e) =>
                            setNewClubData({
                              ...newClubData,
                              contactInfo: {
                                ...newClubData.contactInfo,
                                phone: e.target.value,
                              },
                            })
                          }
                        />
                        <span className="error-message">{formErrors.phone}</span>
                      </label>
                    </div>
                  </div>

                  <div className="column">
                    <div className="form__input">
                      <label>
                        Country:
                        <div className="select-wrapper">
                          <select
                            value={newClubData.location.country || ""}
                            onChange={(e) => {
                              setNewClubData({
                                ...newClubData,
                                location: {
                                  ...newClubData.location,
                                  country: e.target.value,
                                  state: "",
                                  city: "",
                                },
                              });
                              setIsCountrySelected(e.target.value !== "");
                            }}
                          >
                          <option value="">Select Country</option>
                            {Country.getAllCountries().map((country) => (
                              <option key={country.isoCode} value={country.isoCode}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="error-message">{formErrors.country}</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  {isCountrySelected && (
                    <div className="column">
                      <div className="form__input">
                        <label>
                          State:
                          <div className="select-wrapper">
                            <select
                              value={newClubData.location.state || ""}
                              onChange={(e) => {
                                setNewClubData({
                                  ...newClubData,
                                  location: {
                                    ...newClubData.location,
                                    state: e.target.value,
                                    city: "",
                                  },
                                });
                                setIsStateSelected(e.target.value !== "");
                              }}
                              disabled={!newClubData.location.country}
                            >
                              <option value="">Select State</option>
                              {State.getStatesOfCountry(
                                newClubData.location.country
                              )?.map((state) => (
                                <option key={state.isoCode} value={state.isoCode}>
                                  {state.name}, {state.isoCode}
                                </option>
                              ))}
                            </select>
                          </div>
                          <span className="error-message">{formErrors.state}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {isStateSelected && (
                    <div className="column">
                      <div className="form__input">
                        <label>
                          City:
                          <div className="select-wrapper">
                            <select
                              value={newClubData.location.city || ""}
                              onChange={(e) =>
                                setNewClubData({
                                  ...newClubData,
                                  location: {
                                    ...newClubData.location,
                                    city: e.target.value,
                                  },
                                })
                              }
                              disabled={!newClubData.location.state} 
                            >
                              <option value="">Select City</option>
                              {City.getCitiesOfState(
                                newClubData.location.country,
                                newClubData.location.state
                              )?.map((city) => (
                                <option key={city.name} value={city.name}>
                                  {city.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <span className="error-message">{formErrors.city}</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <button type="button" onClick={handleAddOrganizer}>
                  Add Organizers
                </button>
              </div>
              {isOrganizerInputVisible && (
                <>
              <div className="form__input-container">
                <div>
                  <label><strong>Invite Organizers via Email</strong>                    
                  </label>
                  <p style={{color:'black'}}>To invite multiple users, enter multiple email addresses separated by a comma.</p>
                  <input
                    type="text"
                    value={newClubData.organizers
                      .filter((organizer) => organizer.email !== user?.email)
                      .map((organizer) => organizer.email)
                      .join(', ')}
                    onChange={(e) => {
                      const inputEmails = e.target.value.split(',').map((email) => email.trim());
                      const uniqueEmails = Array.from(new Set(inputEmails.filter(email => email !== '')));

                      setNewClubData((prevData) => {
                        const updatedOrganizers = uniqueEmails.map((email) => ({ email }));

                        if (e.target.value.endsWith(',')) {
                          updatedOrganizers.push({ email: '' });
                        }

                        return {
                          ...prevData,
                          organizers: updatedOrganizers,
                        };
                      });
                    }}
                  />


                        <span className="error-message">
                          {formErrors.organizerEmail}
                        </span>
                </div>
              </div>
                </>
                )}

              <button type="submit">Save</button>
              {formErrors.general && (
              <p className="error-message" style={{color:'red'}}>{formErrors.general}</p>
            )}
            </ModalForm>

            {isSuccess && <p>{addClubMessage}</p>}
          </ModalContent>
        </ModalContainer>
      )}
    </ClubListContainer>
  );
};

export default ClubList;

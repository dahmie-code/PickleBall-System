import { useState, useEffect, useCallback } from "react";
import Autosuggest from "react-autosuggest";
import { Link } from "react-router-dom";
import {
  getAllUsers,
  calculateUserAge,
} from "../../firebase/firebaseFunctions";
import MultiRangeSlider from "../MultiRangeSlider/MultiRangeSlider";
import PlayerCard from "./PlayerCard";
import {
  Container,
  PlayerListContainer,
  StickySearchBar,
  FilterOptionsContainer,
  FilterIcon,
  StyledLink,
  AutosuggestWrapper,
  closeButtonStyle,
  filterFullScreen,
} from "./PlayerListStyles";
import Sidebar from "../../sidebarComponent/Sidebar";

const PlayerList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [skillLevelMin, setSkillLevelMin] = useState(2);
  const [skillLevelMax, setSkillLevelMax] = useState(12);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterMinAge, setFilterMinAge] = useState(13);
  const [filterMaxAge, setFilterMaxAge] = useState(100);
  const [filterGender, setFilterGender] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [nameSuggestionsVisible, setNameSuggestionsVisible] = useState(false);
  const [locationSuggestionsVisible, setLocationSuggestionsVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);

        const locationSuggestions = usersData.map(
          (user) => `${user.location.city}, ${user.location.state}, ${user.location.country}`
        );
        setLocationSuggestions(locationSuggestions);

        const nameSuggestions = usersData.map((user) => user.name);
        setNameSuggestions(nameSuggestions);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUserData();
  }, []);

  const filterUsers = useCallback(
    (user) => {
      const singlesSkillLevel = user.rating && user.rating.singles ? parseFloat(user.rating.singles) : 0;
      const doublesSkillLevel = user.rating && user.rating.doubles ? parseFloat(user.rating.doubles) : 0;

      const nameMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase());

      const locationMatch = filterLocation
        ? `${user.location.city}, ${user.location.state}, ${user.location.country}`
            .toLowerCase()
            .includes(filterLocation.toLowerCase())
        : true;

      const ageMatch =
        filterMinAge <= calculateUserAge(user.dateOfBirth) &&
        calculateUserAge(user.dateOfBirth) <= filterMaxAge;

      const genderMatch = filterGender ? user.gender.toLowerCase() === filterGender : true;

      return (
        ((singlesSkillLevel >= skillLevelMin && singlesSkillLevel <= skillLevelMax) ||
          (doublesSkillLevel >= skillLevelMin && doublesSkillLevel <= skillLevelMax)) &&
        locationMatch &&
        ageMatch &&
        genderMatch &&
        nameMatch
      );
    },
    [filterLocation, filterMinAge, filterMaxAge, filterGender, skillLevelMin, skillLevelMax, searchQuery]
  );

  useEffect(() => {
    const filteredUsers = users.filter(filterUsers);
    setFilteredUsers(filteredUsers);
  }, [searchQuery, users, filterUsers]);

  const toggleFilter = () => {
    setIsFilterActive((prev) => !prev);
  };

  const handleSliderChange = ({ min, max }) => {
    setSkillLevelMin(min);
    setSkillLevelMax(max);
  };

  // Autosuggest functions for location
  const getLocationSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : locationSuggestions.filter((location) => location.toLowerCase().includes(inputValue));
  };

  const onLocationSuggestionsFetchRequested = ({ value }) => {
    setLocationSuggestions(getLocationSuggestions(value));
    setLocationSuggestionsVisible(true);
  };

  const onLocationSuggestionsClearRequested = () => {
    setLocationSuggestions(
      users.map(
        (user) => `${user.location.city}, ${user.location.state}, ${user.location.country}`
      )
    );
    setLocationSuggestionsVisible(false);
  };

  const onLocationSuggestionSelected = (_, { suggestion }) => {
    setFilterLocation(suggestion);
  };

  const renderLocationSuggestion = (suggestion) => <div>{suggestion}</div>;

  const locationInputProps = {
    placeholder: "Filter by location",
    value: filterLocation,
    onChange: (event, { newValue }) => setFilterLocation(newValue),
  };

  // Autosuggest functions for name
  const getNameSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : nameSuggestions.filter((name) => name.toLowerCase().includes(inputValue));
  };

  const onNameSuggestionsFetchRequested = ({ value }) => {
    setNameSuggestions(getNameSuggestions(value));
    setNameSuggestionsVisible(true);
  };

  const onNameSuggestionsClearRequested = () => {
    setNameSuggestions(users.map((user) => user.name));
    setNameSuggestionsVisible(false);
  };
  const onNameSuggestionSelected = (_, { suggestion }) => {
    setSearchQuery(suggestion);
  };

  const renderNameSuggestion = (suggestion) => <div>{suggestion}</div>;

  const nameInputProps = {
    placeholder: "Search by name",
    value: searchQuery,
    onChange: (event, { newValue }) => setSearchQuery(newValue),
  };

  const closeFilter = () => {
    setIsFilterActive(false);
    const updatedFilteredUsers = users.filter(filterUsers);
    setFilteredUsers(updatedFilteredUsers);
  };

  const isMobileScreen = () => window.innerWidth < 768;


  return (
    <Container>
      <Sidebar />
      <PlayerListContainer>
        <StickySearchBar>
          <h2>Players List</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AutosuggestWrapper isvisible={nameSuggestionsVisible.toString()}>
              <Autosuggest
              suggestions={getNameSuggestions(searchQuery)}
              onSuggestionsFetchRequested={onNameSuggestionsFetchRequested}
              onSuggestionsClearRequested={onNameSuggestionsClearRequested}
              getSuggestionValue={(suggestion) => suggestion}
              renderSuggestion={renderNameSuggestion}
              onSuggestionSelected={onNameSuggestionSelected}
              inputProps={nameInputProps}
              />            
            </AutosuggestWrapper>
            <div>
            <FilterIcon onClick={toggleFilter} />             
            </div>
          </div>

        </StickySearchBar>
        <div style={{ marginTop: nameSuggestionsVisible ? '120px' : '0' }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <StyledLink key={user.id} to={`profile/${user.id}`}>
                <PlayerCard user={user} />
              </StyledLink>
            ))
          ) : (
            searchQuery.trim() !== "" || isFilterActive ? (
              <p>No players match the selected filters.</p>
            ) : (
              users.map((user) => (
                <Link key={user.id} to={`profile/${user.id}`}>
                  <PlayerCard user={user} />
                </Link>
              ))
            )
          )}
        </div>
      </PlayerListContainer>
      
      {isFilterActive && (
        <div style={isMobileScreen() ? filterFullScreen : {}}>
          <FilterOptionsContainer>
            <>
            <button style={closeButtonStyle} onClick={closeFilter}>X</button>
              <div>
                <h5>
                  Skill Level Range: {skillLevelMin} - {skillLevelMax}
                </h5>
                <MultiRangeSlider
                  min={2}
                  max={12}
                  step={1}
                  value={{ min: skillLevelMin, max: skillLevelMax }}
                  onChange={handleSliderChange}
                />
              </div>
              <div>
                <h5>
                  Age: {filterMinAge} - {filterMaxAge}
                  </h5>
                  <MultiRangeSlider
                    min={13}
                    max={100}
                    value={{ min: filterMinAge, max: filterMaxAge }}
                    step={1}
                    onChange={({ min, max }) => {
                      setFilterMinAge(min);
                      setFilterMaxAge(max);
                    }}
                  />
              </div>
              <div>
                <h5>
                  Location:
                  <AutosuggestWrapper locationSuggestionsVisible={locationSuggestionsVisible}>
                  <Autosuggest
                    suggestions={getLocationSuggestions(filterLocation)}
                    onSuggestionsFetchRequested={onLocationSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onLocationSuggestionsClearRequested}
                    getSuggestionValue={(suggestion) => suggestion}
                    renderSuggestion={renderLocationSuggestion}
                    onSuggestionSelected={onLocationSuggestionSelected}
                    inputProps={locationInputProps}
                    />
                  </AutosuggestWrapper>
                </h5>
              </div>
              <div style={{ marginTop: locationSuggestionsVisible ? '120px' : '0' }}>
                <h5>
                  Gender:
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </h5>
              </div>
            </>
          </FilterOptionsContainer>
        </div>
      )}
    </Container>
  );
};

export default PlayerList;

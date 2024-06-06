import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  MainContainer,
  FormContainer,
  PlayerInputContainer,
  StyledButton,
} from "./css/StyledComponent.jsx";
import { FaTimes } from "react-icons/fa";
import {
  addMatch,
  getAllClubMembers,
  getAllUsers,
  getOrganizerNames,
  getUserClubId,
  isUserOrganizer,
} from "../../firebase/firebaseFunctions.jsx";
import PlayerInput from "./PlayerInput";
import ModalCard from "./ModalCard.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Sidebar from "../../sidebarComponent/Sidebar.jsx";

const CreateMatch = () => {
  const location = useLocation();
  const { isLaunchedByOrganizer } = location.state || {};

  const [matchData, setMatchData] = useState({
    date: "",
    game_type: "",
    team_a: [],
    team_a_score: 0,
    team_b: [],
    team_b_score: 0,
    verified: false,
  });

  const [players, setPlayers] = useState([]);
  const [suggestedPlayersA, setSuggestedPlayersA] = useState([]);
  const [suggestedPlayersB, setSuggestedPlayersB] = useState([]);
  const [selectedTeamA, setSelectedTeamA] = useState([]);
  const [selectedTeamB, setSelectedTeamB] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [dateError, setDateError] = useState("");
  const [gameTypeError, setGameTypeError] = useState("");
  const [teamAError, setTeamAError] = useState("");
  const [teamBError, setTeamBError] = useState("");
  const [teamAScoreError, setTeamAScoreError] = useState("");
  const [teamBScoreError, setTeamBScoreError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timestamp, setCreatedAt] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [clubMembers, setClubMembers] = useState([]);
  const [hasClubMembers, setHasClubMembers] = useState(true);
  const [organizerNames, setOrganizerNames] = useState([]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const playersData = await getAllUsers();
        const allPlayers = Object.values(playersData);
  
        // Get the current user's ID after authentication state changes
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Fetch the user role after getting the current user
            const { clubId } = await getUserClubId(user.uid);

            const currentUser = allPlayers.find(
              (player) => player.id === user.uid
            );

            // Include the current user in the list of selected players
            setCreatedBy(currentUser.id);

            // Check if the current user is an organizer
            const isOrganizer = isLaunchedByOrganizer ? !!isOrganizer : false;

            setIsOrganizer(isOrganizer);

            // Automatically add the current user to Team A if not an organizer
            if (!isOrganizer) {
              // Check if the current user is not already in Team A
              if (
                !selectedTeamA.some(
                  (teamAPlayer) => teamAPlayer.id === currentUser.id
                )
              ) {
                setSelectedTeamA([currentUser]);
              }
            }
            // Fetch organizer names based on their roles
            if (isOrganizer && clubId) {
              const organizerNames = await getOrganizerNames(clubId);
              setOrganizerNames(organizerNames);
            }

            setPlayers([currentUser, ...allPlayers]);
          }
        });

        const currentTime = new Date().toISOString();
        setCreatedAt(currentTime);
  
        // Cleanup the subscription when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error(error);
      }
    }
    async function fetchOrganizerNames() {
      try {
        const auth = getAuth();
        const user = await new Promise((resolve, reject) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              resolve(user);
            } else {
              reject(new Error("User not found."));
            }
            unsubscribe();
          });
        });

        const userClubData = await getUserClubId(user.uid);
        const { clubId } = userClubData;
        if (!clubId && !isOrganizer) {
          throw new Error("Club ID is undefined. The user is not an organizer");
        }
        // Fetch organizer names based on their roles
        const organizerNames = await getOrganizerNames(clubId);
        const isOrganizer = isLaunchedByOrganizer;
        setOrganizerNames(organizerNames);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPlayers();
    fetchOrganizerNames();
  }, [selectedTeamA, isOrganizer, isLaunchedByOrganizer]);

  useEffect(() => {
    async function fetchClubMembers() {
      try {
        const auth = getAuth();
        const user = await new Promise((resolve, reject) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              resolve(user);
            } else {
              reject(new Error("User not found."));
            }
            unsubscribe();
          });
        });

        const userClubData = await getUserClubId(user.uid);

        const { clubId, organizerName } = userClubData;

        if (!clubId) {
          throw new Error("Club ID is undefined.");
        }
        const clubMembers = await getAllClubMembers(String(clubId));

        if (!clubMembers) {
          setHasClubMembers(false);
        } else {
          setHasClubMembers(true);
        }

        if (clubMembers.length === 0) {
          setHasClubMembers(false);
        }

        const userRole = await isUserOrganizer(user.uid, clubId);

        // Check if the user is an organizer based on their role
        const isOrganizer = userRole;

        // Set currentUser using the user information
        const currentUser = {
          id: user.uid,
          name: organizerName,
        };
        setIsOrganizer(isOrganizer);
        setClubMembers(clubMembers);
        setPlayers([currentUser, ...clubMembers]);
        setCreatedBy(user.uid);
      } catch (error) {
        console.error(error);
      }
    }

    fetchClubMembers();
  }, []);

  useEffect(() => {
    async function fetchClubMembers() {
      try {
        const auth = getAuth();
        const user = await new Promise((resolve, reject) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              resolve(user);
            } else {
              reject(new Error('User not found.'));
            }
            unsubscribe();
          });
        });
  
        const userClubData = await getUserClubId(user.uid);
        
        const { clubId, organizerName, role } = userClubData;        

    if (!clubId) {
      throw new Error('Club ID is undefined.');
    }
        const clubMembers = await getAllClubMembers(String(clubId));

        if (!clubMembers) {
  setHasClubMembers(false);
} else {
  setHasClubMembers(true);
}
        
        if (clubMembers.length === 0) {
          setHasClubMembers(false);
        }

        const userRole = await isUserOrganizer(user.uid, clubId);
    
        // Check if the user is an organizer based on their role
        const isOrganizer = userRole;

        // Set currentUser using the user information
        const currentUser = {
          id: user.uid,
          name: organizerName,
          role: role
        };
        setIsOrganizer(isOrganizer)
        setClubMembers(clubMembers);
        setPlayers([currentUser, ...clubMembers]);
        setCreatedBy(user.uid); 
  
      } catch (error) {
        console.error(error);
      }
    }
  
    fetchClubMembers();
  }, []);
  
  
  const clearFormData = () => {
    // Clear form and show success message
    setMatchData({
      date: "",
      game_type: "",
      team_a: [],
      team_a_score: 0,
      team_b: [],
      team_b_score: 0,
      verified: false,
    });

    setSelectedTeamA([]);
    setSelectedTeamB([]);
  };
  
  const handlePlayerInputChange = (inputValue, team) => {
    setActiveTeam(team);

    const allSuggestions = isOrganizer ? [...organizerNames, ...clubMembers] : players;

    const filteredSuggestions = allSuggestions
      .filter(
        (player) =>
          player.name &&
          player.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTeamA.some((teamAPlayer) => teamAPlayer.id === player.id) &&
          !selectedTeamB.some((teamBPlayer) => teamBPlayer.id === player.id)
      );

    if (team === "A") {
      setSuggestedPlayersA(filteredSuggestions);
    } else if (team === "B") {
      setSuggestedPlayersB(filteredSuggestions);
    }
  };


  const handlePlayerInputChangeA = (inputValue) => {
    handlePlayerInputChange(inputValue, "A");
  };

  const handlePlayerInputChangeB = (inputValue) => {
    handlePlayerInputChange(inputValue, "B");
  };
  const handlePlayerSuggestionSelected = (selectedPlayer) => {
    if (isOrganizer) {
      const isClubMember = clubMembers.some(
        (member) => member.id === selectedPlayer.id
      );
      const isOrganizer = organizerNames.some(
        (organizer) => organizer.id === selectedPlayer.id
      );
      // If the player is not a club member or organizer, show an error message
      if (!isClubMember && !isOrganizer) {
        setSubmitError("Selected player is not a club member or organizer.");
        return;
      }
    }
    // Check if the selectedPlayer is already in either team
    const playerAlreadyInTeamA = selectedTeamA.some(
      (player) => player.id === selectedPlayer.id
    );
    const playerAlreadyInTeamB = selectedTeamB.some(
      (player) => player.id === selectedPlayer.id
    );

    // If the player is already in either team, show an error message
    if (playerAlreadyInTeamA || playerAlreadyInTeamB) {
      setSubmitError("Player already selected for a team!");
      return;
    }

    // Clear error messages when a player is selected
    setTeamAError("");
    setTeamBError("");
    setSubmitError("");
    // Check if Team Both are full
    if (selectedTeamA.length >= 2 && selectedTeamB.length >= 2) {
      alert("Both teams are already full!");
      return;
    }

    if (activeTeam === "A" && selectedTeamA.length < 2) {
      setSelectedTeamA([...selectedTeamA, selectedPlayer]);
    } else if (activeTeam === "B" && selectedTeamB.length < 2) {
      setSelectedTeamB([...selectedTeamB, selectedPlayer]);
    }
  };
  const handleRemovePlayer = (playerId) => {
    // Remove the player from the selected teams
    const updatedSelectedTeamA = selectedTeamA.filter(
      (player) => player.id !== playerId
    );
    const updatedSelectedTeamB = selectedTeamB.filter(
      (player) => player.id !== playerId
    );

    // Update the state with the modified selected teams
    setSelectedTeamA(updatedSelectedTeamA);
    setSelectedTeamB(updatedSelectedTeamB);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "date": {
        const currentDate = new Date();
        const selectedDate = new Date(value);

        if (selectedDate > currentDate) {
          setDateError("Please select a date in the past or today.");
        } else {
          setDateError("");
        }
        break;
      }
      case "game_type":
        setGameTypeError("");
        break;

      case "team_a_score": {
        const teamAScore = parseInt(value, 10);

        if (isNaN(teamAScore) || teamAScore < 0 || teamAScore > 25) {
          setTeamAScoreError(
            "Team A score should be a number between 0 and 25."
          );
        } else {
          setTeamAScoreError("");
        }
        break;
      }
      case "team_b_score": {
        const teamBScore = parseInt(value, 10);

        if (isNaN(teamBScore) || teamBScore < 0 || teamBScore > 25) {
          setTeamBScoreError(
            "Team B score should be a number between 0 and 25."
          );
        } else {
          setTeamBScoreError("");
        }
        break;
      }
      case "team_a":
        setTeamAError(
          value.length === 0 ? "Please select players for Team A." : ""
        );
        break;

      case "team_b":
        setTeamBError(
          value.length === 0 ? "Please select players for Team B." : ""
        );
        break;
      default:
        break;
    }

    setMatchData({ ...matchData, [name]: value });
  };

  const handleSuggestionsFetchRequestedA = ({ value }) => {
    handlePlayerInputChangeA(value, "A");
  };

  const handleSuggestionsFetchRequestedB = ({ value }) => {
    handlePlayerInputChangeB(value, "B");
  };

  const validateTeams = () => {
    // Validation for Team A and Team B names
    const teamAError =
      selectedTeamA.length === 0 ? "Please select players for Team A." : "";
    const teamBError =
      selectedTeamB.length === 0 ? "Please select players for Team B." : "";

    // Check if both teams have an equal number of players
    const equalNumberOfPlayersError =
      selectedTeamA.length !== selectedTeamB.length
        ? "Both teams must have an equal number of players."
        : "";

    // Update the state with the error messages
    setTeamAError(teamAError);
    setTeamBError(teamBError);
    setSubmitError(equalNumberOfPlayersError);
  };

  const validateMatchScores = () => {
    // Validation for Team A and Team B scores
    const teamAScore = parseInt(matchData.team_a_score, 10);
    const teamBScore = parseInt(matchData.team_b_score, 10);

    const teamAScoreError =
      isNaN(teamAScore) || teamAScore < 0 || teamAScore > 25
        ? "Team A score should be a number between 0 and 25."
        : "";

    const teamBScoreError =
      isNaN(teamBScore) || teamBScore < 0 || teamBScore > 25
        ? "Team B score should be a number between 0 and 25."
        : "";

    // Update the state with the error messages
    setTeamAScoreError(teamAScoreError);
    setTeamBScoreError(teamBScoreError);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    // Determine if the organizer is a participant in the match
    const isOrganizerParticipant =
      selectedTeamA.some((player) => player.id === createdBy) ||
      selectedTeamB.some((player) => player.id === createdBy);

    // Set verification status based on organizer's participation
    const verificationStatus = isOrganizerParticipant ? false : true;
    // Validate teams and scores
    validateTeams();
    validateMatchScores();

    // Check if there are any errors
    if (
      dateError ||
      gameTypeError ||
      teamAError ||
      teamBError ||
      teamAScoreError ||
      teamBScoreError
    ) {
      setSubmitError("Please fix the errors before submitting the form.");
      return;
    }

    // Create a mapping between field names and labels
    const fieldLabels = {
      date: "Date",
      game_type: "Game Type",
      team_a: "Team A",
      team_b: "Team B",
    };

    // Check for empty fields
    const emptyFields = Object.keys(matchData).filter(
      (key) =>
        (matchData[key] === "" || matchData[key].length === 0) &&
        key !== "team_a" &&
        key !== "team_b"
    );

    // Check if there are selected players in team_a and team_b
    if (
      (emptyFields.includes("team_a") && selectedTeamA.length === 0) ||
      (emptyFields.includes("team_b") && selectedTeamB.length === 0)
    ) {
      setSubmitError(
        `Please fill in the ${fieldLabels.team_a} and ${fieldLabels.team_b} fields with players.`
      );
      return;
    }

    if (emptyFields.length > 0) {
      const emptyFieldLabels = emptyFields
        .map((field) => fieldLabels[field])
        .join(", ");
      setSubmitError(
        `Please fill in the following fields: ${emptyFieldLabels}.`
      );
      return;
    }
    // Check if both teams have an equal number of players
    if (selectedTeamA.length !== selectedTeamB.length) {
      setSubmitError("Both teams must have an equal number of players.");
      return;
    }

    const matchFormat =
      selectedTeamA.length === 2 && selectedTeamB.length === 2
        ? "doubles"
        : "singles";

    // Retrieve ratings for selected players
    const getRatings = (playerId, matchFormat) => {
      const player = players.find((p) => p.id === playerId);
      if (!player) {
        console.error(`Player with ID ${playerId} not found.`);
        return 0;
      }
      if (!player.rating || !player.rating[matchFormat]) {
        console.error(
          `Rating not found for player with ID ${playerId} and match format ${matchFormat}.`
        );
        return 0;
      }
      return player.rating[matchFormat];
    };

    // Map selected players to their Ids and ratings
    const mapPlayersToIdsAndRatings = (selectedPlayers, matchFormat) => {
      return selectedPlayers.map((player) => ({
        id: player.id,
        rating: getRatings(player.id, matchFormat),
      }));
    };

    // Map selected players for both teams
    const selectedPlayersA = mapPlayersToIdsAndRatings(
      selectedTeamA,
      matchFormat
    );
    const selectedPlayersB = mapPlayersToIdsAndRatings(
      selectedTeamB,
      matchFormat
    );

    // Check if all player IDs are defined
    if (
      selectedPlayersA.includes(undefined) ||
      selectedPlayersB.includes(undefined)
    ) {
      console.error("Undefined player ID found. Aborting...");
      return;
    }
    // Update the matchData with selected players
    const updatedMatchData = {
      ...matchData,
      createdBy: createdBy,
      timestamp: timestamp,
      matchFormat: matchFormat,
      team_a: selectedPlayersA,
      team_b: selectedPlayersB,
      verified: verificationStatus,
    };

    try {
      // Add the match and reset form
      await addMatch(updatedMatchData, createdBy, timestamp);

      // Show the success modal
      setShowSuccessModal(true);
      clearFormData();
      setSubmitError("");
    } catch (error) {
      console.error(error);
      if (error.message.includes("Selected player is not a club member.")) {
        // Handle non-club member error
        setSubmitError("Selected player is not a club member.");
      } else {
        // Handle other errors
        setSubmitError(
          "An error occurred while adding the match. Please try again."
        );
      }
    }
  };

  // Close the success modal
  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <MainContainer>
        <Sidebar />
        {isLaunchedByOrganizer || hasClubMembers ? (
          <FormContainer onSubmit={submitForm}>
            <h2>Create a Match</h2>

            <div className="match__date">
              <label htmlFor="date">Match Date:</label>
              <input
                type="date"
                name="date"
                value={matchData.date}
                onChange={handleChange}
              />
              {dateError && <p>{dateError}</p>}
            </div>
            <div className="game__type">
              <label htmlFor="game_type">Game Type:</label>

              {isOrganizer ? (
                // Render options for organizers
                <select
                  name="game_type"
                  value={matchData.game_type}
                  onChange={handleChange}
                  className="selectGame__type"
                >
                  <option value="">Select Game Type</option>
                  <option value="CLUB">CLUB</option>
                  <option value="TOURNAMENT">TOURNAMENT</option>
                </select>
              ) : (
                // Render options for non-organizers
                <select
                  name="game_type"
                  value={matchData.game_type}
                  onChange={handleChange}
                  className="selectGame__type"
                >
                  <option value="">Select Game Type</option>
                  <option value="REC">REC</option>
                  <option value="CLUB">CLUB</option>
                  <option value="TOURNAMENT">TOURNAMENT</option>
                </select>
              )}

              {gameTypeError && <p>{gameTypeError}</p>}
            </div>
            <br />

            <div>
              <label htmlFor="team_a">Team A:</label>
              <PlayerInputContainer>
                <PlayerInput
                  suggestions={suggestedPlayersA}
                  onInputChange={handlePlayerInputChangeA}
                  onSuggestionSelected={handlePlayerSuggestionSelected}
                  onSuggestionsFetchRequested={handleSuggestionsFetchRequestedA}
                  disabled={selectedTeamA.length >= 2}
                />
                {teamAError && <p>{teamAError}</p>}
                <div className="selected__players">
                  <ul>
                    {selectedTeamA.map((player) => (
                      <li key={player.id}>
                        {player.name}
                        <FaTimes
                          className={`delete__icon ${
                            isOrganizer || player.id !== createdBy
                              ? ""
                              : "disabled"
                          }`}
                          onClick={() =>
                            (isOrganizer || player.id !== createdBy) &&
                            handleRemovePlayer(player.id)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </PlayerInputContainer>
            </div>
            <div className="team__score">
              <label htmlFor="team_a_score">Team A Score:</label>
              <input
                type="number"
                min="0"
                max="20"
                name="team_a_score"
                value={matchData.team_a_score}
                onChange={handleChange}
              />
              {teamAScoreError && <p>{teamAScoreError}</p>}
            </div>
            <div>
              <label>Team B:</label>
              <PlayerInputContainer>
                <PlayerInput
                  suggestions={suggestedPlayersB}
                  onInputChange={handlePlayerInputChangeB}
                  onSuggestionSelected={handlePlayerSuggestionSelected}
                  onSuggestionsFetchRequested={handleSuggestionsFetchRequestedB}
                  disabled={selectedTeamB.length >= 2}
                />
                {teamBError && <p>{teamBError}</p>}
                <div className="selected__players">
                  <ul>
                    {selectedTeamB.map((player) => (
                      <li key={player.id}>
                        {player.name}
                        <FaTimes
                          className={`delete__icon ${
                            isOrganizer || player.id !== createdBy
                              ? ""
                              : "disabled"
                          }`}
                          onClick={() =>
                            (isOrganizer || player.id !== createdBy) &&
                            handleRemovePlayer(player.id)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </PlayerInputContainer>
            </div>
            <div className="team__score">
              <label htmlFor="team_b_score">Team B Score:</label>
              <input
                type="number"
                min="0"
                max="20"
                name="team_b_score"
                value={matchData.team_b_score}
                onChange={handleChange}
              />
              {teamBScoreError && <p>{teamBScoreError}</p>}
            </div>
            <StyledButton type="submit">Create Match</StyledButton>

            {submitError && <p>{submitError}</p>}
          </FormContainer>
        ) : (
          <p>There are no players in the club. </p>
        )}
        {showSuccessModal && (
          <ModalCard
            message="Congratulations! Your match has been created successfully!"
            onClose={closeModal}
          />
        )}
      </MainContainer>
    </>
  );
};

export default CreateMatch;

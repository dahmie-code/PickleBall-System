import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserProfileData from "./UserProfileData";
import { getUser,getMatchDetails, calculateUserAge } from "../firebase/firebaseFunctions";
import Sidebar from "../sidebarComponent/Sidebar";
import { BackIcon } from "./ProfileStyles";
import {
  Container,
  DrawMatchHistoryContainer,
  LossMatchHistoryContainer,
  MainContainer,
  MatchCardContainer,
  MatchHistoryContainer,
  Rating,
  RatingContainer,
  RatingDoubles,
  RatingSingles,
  UserProfileContainer,
  UserProfilePerformance,
  WinMatchHistoryContainer,
} from "./ProfileStyles";

const PlayerProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { userData, matchHistory, wins, losses } = UserProfileData(userId);
  const [renderedMatchDetails, setRenderedMatchDetails] = useState([]);
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);

  useEffect(() => {
    const renderMatchHistory = async () => {
      try {
        const matchDetailsPromises = matchHistory.map(async (matchId) => {
          try {
            const matchDetails = await getMatchDetails(matchId);
            const teamAPlayerDetails = await Promise.all(
              matchDetails.team_a.map(async (player) => {
                const playerDetails = await getUser(player.playerId);
                return { ...player, details: playerDetails };
              })
            );
            const teamBPlayerDetails = await Promise.all(
              matchDetails.team_b.map(async (player) => {
                const playerDetails = await getUser(player.playerId);
                return { ...player, details: playerDetails };
              })
            );

            setTeamAPlayers(teamAPlayerDetails);
            setTeamBPlayers(teamBPlayerDetails);

            return matchDetails;
          } catch (error) {
            console.error(`Error fetching details for match ${matchId}:`, error);
            return null;
          }
        });

        const matchDetailsArray = await Promise.all(matchDetailsPromises);
        setRenderedMatchDetails(matchDetailsArray.filter(Boolean));
      } catch (error) {
        console.error("Error rendering match history:", error);
      }
    };

    if (matchHistory) {
      renderMatchHistory();
    }
  }, [matchHistory, userId]);

  const handleBackClick = () => {
    navigate(-1);
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  const calculateOutcome = (matchDetails) => {
    const userInTeamA = matchDetails.team_a.some(
      (player) => player.playerId === userId
    );
    const userInTeamB = matchDetails.team_b.some(
      (player) => player.playerId === userId
    );

    if (
      (userInTeamA && matchDetails.team_a_score > matchDetails.team_b_score) ||
      (userInTeamB && matchDetails.team_b_score > matchDetails.team_a_score)
    ) {
      return "Win";
    } else if (
      (userInTeamA && matchDetails.team_a_score < matchDetails.team_b_score) ||
      (userInTeamB && matchDetails.team_b_score < matchDetails.team_a_score)
    ) {
      return "Loss";
    } else {
      return "Draw";
    }
  };
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };   
  return (
    <MainContainer>
      <Sidebar />
      <Container>
        <div>
          <BackIcon onClick={handleBackClick} />
          <UserProfileContainer>
          <h2>{userData.name}&apos;s Profile</h2>
          <p>
            {userData.location.city}, {userData.location.state},{" "}
            {userData.location.country}
          </p>
          <p>{calculateUserAge(userData.dateOfBirth)}</p>
          <UserProfilePerformance>
            <Rating>
              <RatingContainer>
                <div>
                  <RatingSingles /> Singles
                </div>

                {userData.rating && userData.rating.singles
                  ? userData.rating.singles.toFixed(2) 
                  : "NR"}
              </RatingContainer>
              <RatingContainer>
                <div>
                  <RatingDoubles /> Doubles
                </div>
                {userData.rating && userData.rating.doubles
                  ? userData.rating.doubles.toFixed(2) 
                  : "NR"}
              </RatingContainer>
            </Rating>
            <p className="outcome_cont">Wins: {wins}</p>
            <p className="outcome_cont">Losses: {losses}</p>
          </UserProfilePerformance>
        </UserProfileContainer>
        </div>
        
        
        <MatchHistoryContainer>
          <h3>Match History:</h3>
          {renderedMatchDetails.length === 0 ? (
            <p>No match history yet.</p>
          ) : (<ul>
            {renderedMatchDetails.map((matchDetails, index) => {
              const outcome = calculateOutcome(matchDetails);

              const MatchHistoryContainerComponent =
                outcome === "Win"
                  ? WinMatchHistoryContainer
                  : outcome === "Loss"
                    ? LossMatchHistoryContainer
                    : DrawMatchHistoryContainer;

              return (
                <MatchCardContainer key={index}>
                  <MatchHistoryContainerComponent>
                    <p>Match ID: {matchDetails.id}</p>
                    <div className="outcome">{outcome}</div>
                    <p>
                      {matchDetails.date} (created on{" "}
                      {formatDate(matchDetails.timestamp)})
                    </p>
                    <div className="player__matches">
                      <ul>
                        {teamAPlayers.map((player, playerIndex) => (
                          <li key={playerIndex}>
                            <p>
                              <strong>{player.details.name}</strong>{" "}
                              <span>{player.playerRating.toFixed(2)}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                      <p>
                        <strong>{matchDetails.team_a_score}</strong>
                      </p>
                    </div>
                    <div className="player__matches">
                      <ul>
                        {teamBPlayers.map((player, playerIndex) => (
                          <li key={playerIndex}>
                            <p>
                              <strong>{player.details.name}</strong>{" "}
                              <span>{player.playerRating.toFixed(2)}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                      <p>
                        <strong>{matchDetails.team_b_score}</strong>
                      </p>
                    </div>
                  </MatchHistoryContainerComponent>
                </MatchCardContainer>
              );
            })}
          </ul>)}
        </MatchHistoryContainer>
      </Container>
    </MainContainer>
  );
};

export default PlayerProfile;

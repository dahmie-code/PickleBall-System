import { useState, useEffect } from "react";
import {
  getUser,
  getMatchDetails,
  getMatchHistoryForUser,
} from "../firebase/firebaseFunctions";

const UserProfileData = (userId) => {
  const [userData, setUserData] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const user = await getUser(userId);
        setUserData(user);

        // Fetch match history
        const history = await getMatchHistoryForUser(userId);

        setMatchHistory(history);

        // Check if history is defined and not empty
        if (history && history.length > 0) {
          // Calculate wins and losses
          const newWins = (await Promise.all(
            history.map(async (matchId) => {
              const matchDetails = await getMatchDetails(matchId);

              return (
                matchDetails &&
                ((matchDetails.team_a_score > matchDetails.team_b_score &&
                  matchDetails.team_a?.some(
                    (player) => player.playerId === userId
                  )) ||
                  (matchDetails.team_b_score > matchDetails.team_a_score &&
                    matchDetails.team_b?.some(
                      (player) => player.playerId === userId
                    )))
              );
            })
          )).filter(Boolean).length;

          const newLosses = (await Promise.all(
            history.map(async (matchId) => {
              const matchDetails = await getMatchDetails(matchId);
              return (
                matchDetails &&
                ((matchDetails.team_a_score < matchDetails.team_b_score &&
                  matchDetails.team_a?.some(
                    (player) => player.playerId === userId
                  )) ||
                  (matchDetails.team_b_score < matchDetails.team_a_score &&
                    matchDetails.team_b?.some(
                      (player) => player.playerId === userId
                    )))
              );
            })
          )).filter(Boolean).length;

          setWins(newWins);
          setLosses(newLosses);


// Fetch details for team A and team B
const teamAPlayersDetails = [];
const teamBPlayersDetails = [];

// Loop through the history to fetch details for each match
for (const matchId of history) {
  const matchDetails = await getMatchDetails(matchId);

  // Add a check to ensure matchDetails is not null
  if (matchDetails) {
    // Fetch player details for team A
    const teamAPlayerPromises = matchDetails.team_a.map(async (player) => {
      const playerDetails = await getUser(player.playerId);
      return { ...player, details: playerDetails };
    });

    // Fetch player details for team B
    const teamBPlayerPromises = matchDetails.team_b.map(async (player) => {
      const playerDetails = await getUser(player.playerId);
      return { ...player, details: playerDetails };
    });

    const teamAPlayersForMatch = await Promise.all(teamAPlayerPromises);
    const teamBPlayersForMatch = await Promise.all(teamBPlayerPromises);

    // Concatenate the details for each match
    teamAPlayersDetails.push(...teamAPlayersForMatch);
    teamBPlayersDetails.push(...teamBPlayersForMatch);
  }
}

          setTeamAPlayers(teamAPlayersDetails);
          setTeamBPlayers(teamBPlayersDetails);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchData();
  }, [userId]);

  return { userData, matchHistory, wins, losses, teamAPlayers, teamBPlayers };
};

export default UserProfileData;

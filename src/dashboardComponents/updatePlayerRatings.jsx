/* eslint-disable no-inner-declarations */
import { getMatchDetails } from '../firebase/firebaseFunctions';
import { db, set, ref, get, update } from '../firebase/Firebase';

async function getGameTypeForMatch(matchId) {
    const matchRef = ref(db, `/matches/${matchId}/game_type`);
    try {
      const snapshot = await get(matchRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting gameType for match:', error);
      return null;
    }
}
  
async function getNumGamesPlayedForPlayer(playerId) {
    const playerRef = ref(db, `/players/${playerId}/match_history`);
    try {
      const snapshot = await get(playerRef);
      return snapshot.exists() ? snapshot.val().length : 0;
    } catch (error) {
      console.error('Error getting numGamesPlayed:', error);
      return 0;
    }
}
  
function getGameTypeCoefficient(gameType) {
    const coefficients = {
      REC: 0.4, 
      CLUB: 0.6,
      TOURNAMENT: 1.0
    }
    return coefficients[gameType] || 0;
  }
  
export const updatePlayerRatings = async (matchId) => {
    try {
        const matchDetails = await getMatchDetails(matchId);
  
        if (matchDetails) {
            // Access team_a and team_b data from matchDetails
            const teamA = matchDetails.team_a;
            const teamB = matchDetails.team_b;
            const teamAScore = matchDetails.team_a_score;
            const teamBScore = matchDetails.team_b_score;
  
            function calculateTeamRating(team) {
              const playerRatings = team.map(player => player.playerRating);
  
              const weakerPlayerRating = Math.min(...playerRatings);
              const strongerPlayerRating = Math.max(...playerRatings);
  
              const teamRating = ((strongerPlayerRating - weakerPlayerRating) * 0.35) + weakerPlayerRating;
              return teamRating;
            }
  
            function calculateWinProbability(teamARating, teamBRating) {
              const winProbability = 1 / (1 + Math.pow(10, (teamBRating - teamARating) / 3.5));
              return winProbability;
            }
  
            function simulateSingleGame(probA) {
              let scoreA = 0;
              let scoreB = 0;
              while (scoreA < 11 && scoreB < 11) {
                if (Math.random() < probA) {
                  scoreA++;
                } else {
                  scoreB++;
                }
              }
              return [scoreA, scoreB];
            }
  
            const teamARating = calculateTeamRating(teamA);
            const teamBRating = calculateTeamRating(teamB);
  
            const winProbA = calculateWinProbability(teamARating, teamBRating);
  
            //TODO: REVIEW THIS!!!
            function getExpectedScore() {
              let totalScoreA = 0;
              let totalScoreB = 0;
              const numGames = 100;
              const outcomes = {};
  
              for (let i = 0; i < numGames; i++) {
                const [scoreA, scoreB] = simulateSingleGame(winProbA);
                totalScoreA += scoreA;
                totalScoreB += scoreB;
                const outcome = `${scoreA}-${scoreB}`;
                outcomes[outcome] = (outcomes[outcome] || 0) + 1;
              }
              return Object.keys(outcomes).reduce((a, b) => outcomes[a] > outcomes[b] ? a : b);
            }
  
            const [teamAPredictedScore, teamBPredictedScore] = getExpectedScore().split('-').map(Number);
  
            function calculateRatingChange(players, teamARating, teamBRating, gameType, numGamesPlayed) {
                const gameTypeCoefficient = getGameTypeCoefficient(gameType);
                const maxChange = 0.5;
    
                let ratingChanges = [];
    
                players.forEach(player => {
                    const isTeamBPlayer = !teamA.some(teamAPlayer => teamAPlayer.playerId === player.playerId)
                    const score = isTeamBPlayer? teamBScore : teamAScore;
                    const predictedScore = isTeamBPlayer? teamBPredictedScore : teamAPredictedScore;
    
                    let winProbability = calculateWinProbability(teamARating, teamBRating);
                    winProbability = isTeamBPlayer ? 1 - winProbability : winProbability
    
                    const result = getMatchResultFor(player, teamAScore, teamBScore);

                    let ratingChange = maxChange * (result - winProbability) * gameTypeCoefficient;
    
                    if (numGamesPlayed < 10) {
                    ratingChange *= 1.2;
                    } else if (numGamesPlayed < 20) {
                    ratingChange *= 1.1;
                    } else if (numGamesPlayed < 30) {
                    ratingChange *= 1;
                    }

                    if (gameType === 'REC') {
                    ratingChange *= 0.6; 
                    } else if (gameType === 'CLUB') {
                    ratingChange *= 0.8; 
                    } else if (gameType === 'TOURNAMENT') {
                    ratingChange *= 1.0; 
                    }
    
                    const difference = Math.abs(score - predictedScore);
                    const expectedPointsMultiplier = 1 + (difference / predictedScore);
                    ratingChange *= expectedPointsMultiplier;
    
                    ratingChanges.push({ playerId: player.playerId, ratingChange });
                });
    
                return ratingChanges;
            }


            function getMatchResultFor(player, teamAScore, teamBScore) {
                const isTeamBPlayer = !teamA.some(teamAPlayer => teamAPlayer.playerId === player.playerId)
                let result = teamAScore > teamBScore ? 1 : teamAScore === teamBScore ? 0.5 : 0; 
                result = isTeamBPlayer ? 1 - result : result
                return result
              }
  
            const players = [...teamA, ...teamB];

            for (const player of players) {
                const gameType = await getGameTypeForMatch(matchId);
                const numGamesPlayed = await getNumGamesPlayedForPlayer(player.playerId);

                console.log(`Player ID: ${player.playerId}, GameType: ${gameType}, NumGamesPlayed: ${numGamesPlayed}`);
                 
                const ratingChanges = calculateRatingChange(players, teamARating, teamBRating, gameType, numGamesPlayed);
                const ratingChangeForPlayer = ratingChanges.find(change => change.playerId === player.playerId)?.ratingChange;
                console.warn(ratingChangeForPlayer)
                const matchFormat = matchDetails.matchFormat;
    

                const playerRef = ref(db, `/players/${player.playerId}/rating/${matchDetails.matchFormat}`);
                const playerSnapshot = await get(playerRef);
        
                if (playerSnapshot.exists()) {
                    const currentRating = playerSnapshot.val();
                    const newRating = currentRating + ratingChangeForPlayer;
            
                    // Update the player's rating in the Firebase database under singles or doubles based on matchFormat
                    await set(playerRef, newRating);
                    console.warn(`Player ${player.playerId}: ${matchDetails.matchFormat} Rating updated to ${newRating}`);
                        
                    // Determine the team path (team_a or team_b) for the player in the match
                    const teamPath = matchDetails.team_a.some(teamPlayer => teamPlayer.playerId === player.playerId) ? 'team_a' : 'team_b';
                    const playerIndex = matchDetails[teamPath].findIndex(teamPlayer => teamPlayer.playerId === player.playerId);
                    
                    if (playerIndex !== -1) {
                    // Save the ratingChange in the matches node under the player's team
                    const playerInMatchPath = `matches/${matchId}/${teamPath}/${playerIndex}`;
                    const playerInMatchRef = ref(db, playerInMatchPath);
                    
                    const playerInMatch = await get(playerInMatchRef);
                    
                    // Check if the change exists in the array before adding it
                        if (playerInMatch.val().ratingChange !== ratingChangeForPlayer) {
                            await update(playerInMatchRef, {ratingChange: ratingChangeForPlayer});
                            console.warn(`Rating change (${ratingChangeForPlayer}) saved for Player ${player.playerId} in ${teamPath}`);
                        } else {
                            console.log(`Rating change (${ratingChangeForPlayer}) already exists for Player ${player.playerId} in ${teamPath}`);
                        }
                    } else {
                        console.error(`Player ${player.playerId} not found in ${teamPath} for match ${matchId}`);
                    }
                    
                } else {
                    console.error(`Player ${player.playerId} not found for ${matchFormat}`);
                }
            }
        } else {
            console.error("Match details not found.");
        }
    } catch (error) {
        console.error("Error updating player ratings:", error);
    }
};
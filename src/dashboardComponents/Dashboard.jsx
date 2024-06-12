import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { db, auth, ref, get } from '../firebase/Firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserGroup, faCaretUp, faCaretDown, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import {
    updateVerificationStatus,
    getMatchHistoryForUser,
    getMatchDetails,
    getUser,
    calculateUserAge
} from '../firebase/firebaseFunctions';
import { updatePlayerRatings } from './updatePlayerRatings'; 
import { calculateSummaryStatistics } from './MatchStatistics';
import Sidebar from '../sidebarComponent/Sidebar';
import LineChart from './LineChart';
// import GraphImg from '../assets/Graph.png'; 
import './Dashboard.css';

const Dashboard = () => {
    const [userId, setUserId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [singlesRating, setSinglesRating] = useState(0);
    const [doublesRating, setDoublesRating] = useState(0);
    const [matches, setMatches] = useState([]);
    const [filter, setFilter] = useState('all');
    const [matchDetails, setMatchDetails] = useState({});
    const [summaryStats, setSummaryStats] = useState({});
    const [playerDetails, setPlayerDetails] = useState({});
    const [message, setMessage] = useState('');
    const [showButton, setShowButton] = useState(true);
    const [verifiedMatchId, setVerifiedMatchId] = useState(null);
    const [statsType, setStatsType] = useState('singles');
    const [graphData, setGraphData] = useState({ labels: [], datasets: [] });
    // const [expandedMatchId, setExpandedMatchId] = useState(null);
    // const [playerCards, setPlayerCards] = useState([]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            setUserId(user.uid);
        } 
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch ratings when userId changes
    if (userId) {
    // Simulating data retrieval based on filters
    const fetchRatings = async () => {
      try {
      const singlesRef = ref(db, `players/${userId}/rating/singles`);
      const doublesRef = ref(db, `players/${userId}/rating/doubles`);

      const singlesSnapshot = await get(singlesRef);
        const doublesSnapshot = await get(doublesRef);

          if (singlesSnapshot.exists()) {
            setSinglesRating(singlesSnapshot.val());
          }

          if (doublesSnapshot.exists()) {
            setDoublesRating(doublesSnapshot.val());
          }
        } catch (error) {
          console.error('Error fetching ratings:', error);
        }
      };

  fetchRatings();
  }
}, [userId]);

const handleDateChange = (date) => {
    setSelectedDate(date);
};

useEffect(() => {
    const fetchMatchHistory = async () => {
    try {
        if (userId) {
        const matchHistory = await getMatchHistoryForUser(userId);
        if (matchHistory && Array.isArray(matchHistory)) {
            setMatches(matchHistory);
        } else {
            console.error('Invalid match history format:', matchHistory);
        }
        }
    } catch (error) {
        console.error('Error fetching match history:', error);
    }
    };
    fetchMatchHistory();
}, [userId]);

const fetchPlayerDetails = async (playerIds) => {
    try {
        const detailsPromises = playerIds.map(async (playerId) => {
            const playerDetails = await getUser(playerId);
            return { [playerId]: playerDetails };
        });

        const playerDetailsArray = await Promise.all(detailsPromises);
        const combinedPlayerDetails = Object.assign({}, ...playerDetailsArray.filter(Boolean));

        setPlayerDetails(combinedPlayerDetails);
    } catch (error) {
        console.error('Error fetching player details:', error);
    }
};

useEffect(() => {
    const fetchDetails = async () => {
        try {
            const detailsPromises = matches.map(async (matchId) => {
                const match = await getMatchDetails(matchId);
                return match ? { [matchId]: match } : null;
            });
            const matchDetailsArray = await Promise.all(detailsPromises);
            const filteredMatchDetails = Object.values(Object.assign({}, ...matchDetailsArray.filter(Boolean)));
            
            setMatchDetails(Object.assign({}, ...matchDetailsArray.filter(Boolean)));

            const playerIds = filteredMatchDetails
                .flatMap((match) => [
                    ...(match.team_a || []).map((player) => player.playerId || null),
                    ...(match.team_b || []).map((player) => player.playerId || null),
                ])
                .filter(Boolean);

            await fetchPlayerDetails(playerIds);

        } catch (error) {
            console.error('Error fetching match details:', error);
        }
    }
    fetchDetails();
}, [matches]);

useEffect(() => {
    const verifiedMatches = Object.values(matchDetails).filter(
        (match) => match.verified === true
    );
    const stats = calculateSummaryStatistics(verifiedMatches);
    setSummaryStats(stats);
}, [matchDetails]);

useEffect(() => {
    const labels = matches.map((matchId) => {
        const match = matchDetails[matchId];
        return match ? new Date(match.date).toLocaleDateString() : '';
    });

    const singlesData = matches.map((matchId) => {
        const match = matchDetails[matchId];
        return match ? match.singlesRating : 0;
    });

    const doublesData = matches.map((matchId) => {
        const match = matchDetails[matchId];
        return match ? match.doublesRating : 0;
    });

    setGraphData({
        labels,
        datasets: [
            {
                label: 'Singles Rating',
                data: singlesData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
            {
                label: 'Doubles Rating',
                data: doublesData,
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: true,
            },
        ],
    });
}, [matches, matchDetails]);

const filteredMatches = matches.filter((matchId) => {
    const match = matchDetails[matchId];
    
    if (!match) return false; // If match details are not available, exclude the match
    
    switch (filter) {
        case 'singles':
            return match.team_a.length === 1 && match.team_b.length === 1;
        case 'doubles':
            return match.team_a.length === 2 && match.team_b.length === 2;
        case 'wins':
            return match.verified && match.team_a_score > match.team_b_score;
        case 'losses':
            return match.verified && match.team_a_score < match.team_b_score;
        case 'pending':
            return match.verified === false;
        case 'verified':
            return match.verified === true;
        default:
            return true; // Show all matches for 'all' filter
    }
});

const handleVerification = async (matchId, playerId) => {
    try {
        await updateVerificationStatus(matchId, playerId);
        await updatePlayerRatings(matchId);

        setVerifiedMatchId(matchId);
        setShowButton(false);
        setMessage('Verification successful');
        setTimeout(() => {
            setMessage('');
            setVerifiedMatchId(null);
            // Reload the page after 5 seconds
            window.location.reload();
        }, 5000);
    } catch (error) {
        console.error('Error verifying match:', error);
    }
};

const generatePlayerCards = (matchId) => {
    const match = matchDetails[matchId];
  
    if (!match) return null;
  
    const matchParticipants = [...match.team_a, ...match.team_b];
    const teamAPlayersCount = match.team_a.length;
    const teamAWins = match.team_a_score > match.team_b_score;

    const cards = matchParticipants.map((player, index) => {
        const playerInfo = playerDetails[player.playerId];
        if (!playerInfo) return null;
    
        const { name, dateOfBirth, gender, location } = playerInfo;
        const age = calculateUserAge(dateOfBirth);
        const formattedGender = gender.charAt(0).toUpperCase() + gender.slice(1);
        const { playerRating, ratingChange } = player;

        // Check if playerRating and ratingChange are defined
        const formattedPlayerRating =  playerRating ? playerRating.toFixed(2) : 'N/A';
        
        // Extract the single value from ratingChanges array if available
        let ratingChangeIcon = null;

        if (ratingChange !== null || ratingChange !== undefined) {
            var formattedRatingChange = parseFloat(ratingChange).toFixed(3);

            if ((index < teamAPlayersCount && teamAWins) || (index >= teamAPlayersCount && !teamAWins)) {
                ratingChangeIcon = (
                    <FontAwesomeIcon
                        icon={faCaretUp}
                        style={{ color: 'green' }}
                    />
                );
            } else {
                ratingChangeIcon = (
                    <FontAwesomeIcon
                        icon={faCaretDown}
                        style={{ color: 'red'}}
                    />
                );
            }
        }

        // Calculate the updated rating if both playerRating and ratingChange are defined
        let updatedRating = 'N/A';
        if (typeof playerRating !== 'undefined' && typeof ratingChange !== 'undefined') {
            updatedRating = (parseFloat(playerRating) + parseFloat(ratingChange)).toFixed(2);
        }

        let teamScores = null;

        if (index === teamAPlayersCount - 1) {
            const teamAScoreStyle = teamAWins ? { fontWeight: 'bold' } : { fontWeight: 'normal' };
            const teamBScoreStyle = teamAWins ? { fontWeight: 'normal' } : { fontWeight: 'bold' };

            teamScores = (
                <div className="team-scores">
                    <p style={teamAScoreStyle}> {match.team_a_score}</p>
                    <p style={teamBScoreStyle}> {match.team_b_score}</p>
                </div>
            );
        }

        const isTeamAScoreHigher = match.team_a_score > match.team_b_score;
        const isPlayerInTeamA = index < teamAPlayersCount;
        const ratingColor = isTeamAScoreHigher === isPlayerInTeamA ? 'green' : 'red';
    
      return (
        <div key={index} className='matchcard'>
            <div className='card'>
                <div className='details'>
                    <div className='top-section'>
                        <span style={{ backgroundColor: '#003977', borderRadius: '50%',padding: '3px 6px' }}>
                            <FontAwesomeIcon icon={faUser} style={{ color: '#fff' }} /> 
                        </span>
                        <span className='name'>{name}</span>
                    </div>
                    <p className='info'>{age} &#x2022; {formattedGender} &#x2022; {location.city}, {location.state}, {location.country}</p>
                    <div className='row'>
                        <div className='big-column'>
                            <div className='box-container'>
                                <p className='column'>{formattedPlayerRating}</p>
                            </div>
                        </div>
                        <div className='small-column'>
                            <p className='column' style={{ color: ratingColor }}>{formattedRatingChange} {ratingChangeIcon}</p>
                        </div>
                        <div className='big-column'>
                        <div className='box-container' style={{ backgroundColor: ratingColor === 'green' ? 'rgb(230, 250, 230)' : ratingColor === 'red' ? 'rgb(250, 230, 230)' : 'transparent' }}>
                                <p className='column' style={{ color: ratingColor }}>{updatedRating}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
            {teamScores}
        </div>
      );
    });
  
    return cards.filter(Boolean);
};
  

const getPlayerName = (playerId) => {
    const player = playerDetails[playerId];
    return player ? player.name : 'Unknown';
};

const handleFilterChange = (e) => {
    setFilter(e.target.value);
};

const handleStatsToggle = (type) => {
    setStatsType(type);
}
  


  return (
      <div className="dashboard-container">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="dashboard-content">
          <div className="left-column">
          <h1>My Performance</h1>
            <div className="rating-buttons">
                <button 
                    onClick={() => handleStatsToggle('singles')} 
                    className="rating-button"
                >
                    <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                    Singles <br /> {singlesRating.toFixed(3)}
                </button>
                <button 
                    onClick={() => handleStatsToggle('doubles')} 
                    className="rating-button"
                >
                    <FontAwesomeIcon icon={faUserGroup} style={{ marginRight: '10px' }} />
                    Doubles <br></br> {doublesRating.toFixed(3)}
                </button>
            </div>
            <div className="summary-stats">
                {statsType === 'singles' && (
                    <>
                        <p>Wins: {summaryStats.singlesStats ? summaryStats.singlesStats.winCount : 0}</p>
                        <p>Losses: {summaryStats.singlesStats ? summaryStats.singlesStats.lossCount : 0}</p>
                        <p>Average Scored: {summaryStats.singlesStats ? summaryStats.singlesStats.averagePointsScored : 0}</p>
                        <p>Average Conceded: {summaryStats.singlesStats ? summaryStats.singlesStats.averagePointsConceded: 0}</p>
                    </>
                )}
                {statsType === 'doubles' && (
                    <>
                        <p>Wins: {summaryStats.doublesStats.winCount}</p>
                        <p>Losses: {summaryStats.doublesStats.lossCount}</p>
                        <p>Average Scored: {summaryStats.doublesStats.averagePointsScored}</p>
                        <p>Average Conceded: {summaryStats.doublesStats.averagePointsConceded}</p>
                    </>
                )}
            </div>
            {/* <div className='calender-and-graph'>
                <div className='calender'>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize:'25px' , marginRight: '20px' }} />
                    <DatePicker selected={selectedDate} onChange={handleDateChange} />
                </div>
                <div className="graph">
                    <img className="fluid-image" src={GraphImg} alt="Graph"/>
                </div>
            </div> */}
        </div>
        <div className="right-column">
            <label>
                Matches: {' '}
                <select value={filter} onChange={handleFilterChange}>
                <option value="all">All</option>
                <option value="singles">Singles</option>
                <option value="doubles">Doubles</option>
                <option value="wins">Wins</option>
                <option value="losses">Losses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                </select>
            </label>
            <div className="match-cards-container">
                {filteredMatches.length === 0 && (
                    <p>There are no matches matching the selected filter criteria.</p>
                )}

                {filteredMatches.map((matchId) => {
                    const match = matchDetails[matchId];

                    if (!match) return null;

                        let result;

                        if (!match.verified) {
                            result = 'Pending';
                        } else {
                            result =
                            match.team_a_score > match.team_b_score
                                ? 'Win'
                                : match.team_a_score < match.team_b_score
                                ? 'Loss'
                                : 'Pending';
                        }
                        const currentUserId = userId;
                        // Determine the opposite team's player ID
                        const oppositeTeamPlayerId = match.team_a[0].playerId === currentUserId
                            ? match.team_b[0].playerId
                            : match.team_a[0].playerId;

                        const createdByCurrentUser = match.createdBy === currentUserId;

                        return (
                            <div key={matchId} className="match-card">
                            {match && (
                                <div className={result === 'Pending' ? 'pending-card' : 'card'}>
                                    {result === 'Pending' ? (
                                        <div className="card">
                                            <p className="result" style={{ color: result === 'Win' ? 'green' : result === 'Loss' ? 'red' : 'black' }}>{result}</p>
                                            <p className="date">Date: {match.date}</p>
                                            <hr />
                                            <p className="game-type">{match.game_type}</p>
                                            <div className="team">
                                                <ul>
                                                {match.team_a.map((player, playerIndex) => {
                                                    return (
                                                    <li key={playerIndex}>
                                                        <div>
                                                            <span style={{ backgroundColor: '#003977', borderRadius: '50%',padding: '3px 6px' }}>
                                                                <FontAwesomeIcon icon={faUser} style={{ color: '#fff' }} /> 
                                                            </span>{' '}
                                                            <span className="player-name">
                                                                {getPlayerName(player.playerId)} {'  '}
                                                            </span>
                                                            <span>
                                                                {player.playerRating}
                                                            </span>
                                                        </div>
                                                    </li>
                                                    );
                                                    })}
                                                </ul>
                                                <p>{match.team_a_score}</p>
                                            </div>
                                            <div className="team">
                                                <ul>
                                                {match.team_b.map((player, playerIndex) => {
                                                    return (
                                                    <li key={playerIndex}>
                                                    <div>
                                                        <span style={{ backgroundColor: '#003977', borderRadius: '50%',padding: '3px 6px' }}>
                                                            <FontAwesomeIcon icon={faUser} style={{ color: '#fff' }} /> 
                                                        </span>{' '}
                                                        <span className="player-name">
                                                            {getPlayerName(player.playerId)} {'  '}
                                                        </span>
                                                        <span>
                                                            {player.playerRating}
                                                        </span>
                                                    </div>
                                                    </li>
                                                    );
                                                })}
                                                </ul>
                                                <p>{match.team_b_score}</p>
                                            </div>
                                            <hr />
                                            <p className='match-id'>ID: {matchId}</p>
                                            <div className="verification-container">
                                                {!match.verified && !createdByCurrentUser && showButton &&(
                                                    <div className="verification-button">
                                                        <button onClick={() => handleVerification(matchId, oppositeTeamPlayerId)}>
                                                            Verify
                                                        </button>
                                                    </div>
                                                )}
                                                {verifiedMatchId === matchId && <div className="verification-message">{message}</div>}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                          <div>
                                            <p className="result" style={{ color: result === 'Win' ? 'green' : result === 'Loss' ? 'red' : 'black' }}>{result}</p>
                                            <p className="date">Date: {match.date}</p>
                                            <hr />
                                            <p className="game-type">{match.game_type}</p>
                                            <div className="Playercard">
                                                {generatePlayerCards(matchId)}
                                            </div>
                                            <hr />
                                            <p className='match-id'>ID: {matchId}</p>
                                            <div className="verification-container">
                                                {!match.verified && !createdByCurrentUser && showButton &&(
                                                    <div className="verification-button">
                                                        <button onClick={() => handleVerification(matchId, oppositeTeamPlayerId)}>
                                                            Verify
                                                        </button>
                                                    </div>
                                                )}
                                                {verifiedMatchId === matchId && <div className="verification-message">{message}</div>}
                                            </div>
                                        </div>
                                        </>
                                      )}
                                    </div>
                            )}
                            </div>
                        );
              })}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;


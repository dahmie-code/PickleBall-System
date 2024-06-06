
export const calculateSummaryStatistics = (matchHistory) => {
  let winCountSingles = 0;
  let lossCountSingles = 0;
  let totalPointsScoredSingles = 0;
  let totalPointsConcededSingles = 0;

  let winCountDoubles = 0;
  let lossCountDoubles = 0;
  let totalPointsScoredDoubles = 0;
  let totalPointsConcededDoubles = 0;

  const verifiedMatches = matchHistory.filter((match) => match.verified);

  verifiedMatches.forEach((match) => {
      if (match.team_a.length === 1 && match.team_b.length === 1) {
          if (match.team_a_score > match.team_b_score) {
              winCountSingles++;
          } else if (match.team_a_score < match.team_b_score) {
              lossCountSingles++;
          }
          totalPointsScoredSingles += match.team_a_score;
          totalPointsConcededSingles += match.team_b_score;
      } else if (match.team_a.length === 2 && match.team_b.length === 2) {
          if (match.team_a_score > match.team_b_score) {
              winCountDoubles++;
          } else if (match.team_a_score < match.team_b_score) {
              lossCountDoubles++;
          }
          totalPointsScoredDoubles += match.team_a_score;
          totalPointsConcededDoubles += match.team_b_score;
      }
  });

  const matchCountSingles = winCountSingles + lossCountSingles;
  const averagePointsScoredSingles = matchCountSingles ? totalPointsScoredSingles / matchCountSingles : 0;
  const averagePointsConcededSingles = matchCountSingles ? totalPointsConcededSingles / matchCountSingles : 0;

  const matchCountDoubles = winCountDoubles + lossCountDoubles;
  const averagePointsScoredDoubles = matchCountDoubles ? totalPointsScoredDoubles / matchCountDoubles : 0;
  const averagePointsConcededDoubles = matchCountDoubles ? totalPointsConcededDoubles / matchCountDoubles : 0;

  return {
      singlesStats: {
          winCount: winCountSingles,
          lossCount: lossCountSingles,
          averagePointsScored: averagePointsScoredSingles,
          averagePointsConceded: averagePointsConcededSingles,
      },
      doublesStats: {
          winCount: winCountDoubles,
          lossCount: lossCountDoubles,
          averagePointsScored: averagePointsScoredDoubles,
          averagePointsConceded: averagePointsConcededDoubles,
      },
  };
};

// Mock match history data
// const matchHistory = [
//   {
//       team_a: [{ playerId: 'player1' }],
//       team_b: [{ playerId: 'player2' }],
//       team_a_score: 21,
//       team_b_score: 17,
//       verified: true,
//   },
//   {
//       team_a: [{ playerId: 'player3' }, { playerId: 'player4' }],
//       team_b: [{ playerId: 'player5' }, { playerId: 'player6' }],
//       team_a_score: 21,
//       team_b_score: 19,
//       verified: true,
//   },
//   // Add more sample matches with varying team sizes and scores
//   // ...
// ];

// const summaryStats = calculateSummaryStatistics(matchHistory);
// console.log('Singles Stats:', summaryStats.singlesStats);
// console.log('Doubles Stats:', summaryStats.doublesStats);

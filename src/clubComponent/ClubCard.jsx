import { ClubContainer } from './ClubListStyles';
import { Link } from 'react-router-dom';

const ClubCard = ({ club }) => {
  const memberCount = club.members ? Object.keys(club.members).length : 0;
  const memberLabel = memberCount === 1 ? 'member' : 'members';
  return (
    <ClubContainer>
      <Link to={`/club/${club.id}`} className="club-link">
      <div className="club-card">
        <h3>{club.name}</h3>
          <small>{club.city}</small>
          <p className="member-count">{memberCount} {memberLabel}</p>
        </div>  
      </Link>
    </ClubContainer>
  );
};

export default ClubCard;
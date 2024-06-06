import {
    PlayerCardContainer,
    PlayerHeader,
    PlayerName,
    Rating,
    RatingContainer,
    RatingSingles,
    RatingDoubles,
    UserImage,
    PlayerContent,
} from './PlayerListStyles';
import { calculateUserAge } from '../../firebase/firebaseFunctions';

const PlayerCard = ({ user, onClick }) => (
    <PlayerCardContainer onClick={onClick}>
      <PlayerHeader>
        <PlayerContent>
          <div>
            <UserImage />
          </div>
          <div>
            <PlayerName>{user.name}</PlayerName>
            <p> 
              <span>{calculateUserAge(user.dateOfBirth)}</span> {' '}
              <span style={{fontSize:'10px'}}>&#9679;</span> {' '}
              <span>{(user.gender.toLowerCase() === 'male') ? 'M' : (user.gender.toLowerCase() === 'female') ? 'F' : 'Other'}</span> {' '}
              <span style={{fontSize:'10px'}}>&#9679;</span> {' '}
              <span>{(user.location.city && user.location.state && user.location.country) ? `${user.location.city}, ${user.location.state}, ${user.location.country}` : user.location.city || user.location.state || ''}</span>   
            </p>
          </div>                
        </PlayerContent>
        <Rating>
          <RatingContainer>
            <RatingSingles />
            <div>
              {user.rating && user.rating.singles ? user.rating.singles.toFixed(2) : "NR"}
            </div>
          </RatingContainer>
          <RatingContainer>
            <RatingDoubles />
            <div>
              {user.rating && user.rating.doubles ? user.rating.doubles.toFixed(2) : "NR"}
            </div>
          </RatingContainer>
        </Rating>
      </PlayerHeader>
    </PlayerCardContainer>
  );
  
export default PlayerCard;
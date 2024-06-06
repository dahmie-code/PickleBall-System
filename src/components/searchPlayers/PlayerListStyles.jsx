import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaUser, FaUserGroup, FaCircleUser } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const PlayerListContainer = styled.div`
  flex: 1;
  padding: 20px;
  padding-top: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  position: relative;
`;

const StickySearchBar = styled.div`
  position: sticky;
  background-color: white;
  top: 0;
  z-index: 100;
  padding: 20px 10px;
  width:100%;
  input{
    width: 100%;
    box-sizing: border-box;
  }
`;
const AutosuggestWrapper = styled.div`
  position: relative;
  width: 100%;

  input {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border-radius: 4px;x
  }

  .react-autosuggest__suggestions-container {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  .react-autosuggest__suggestions-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 120px;
    overflow-y: auto;
  }

  .react-autosuggest__suggestion {
    padding: 10px;
    cursor: pointer;

    &:hover {
      background-color: #f2f2f2;
    }
  }

  .react-autosuggest__suggestion--highlighted {
    background-color: #ddd;
  }
`;
const StyledLink = styled(Link)`
  color: #003977;
  text-decoration: none;

&:hover{
  color: #144880;
  text-decoration: underline;
}
p{
  color: #A9A9A9;
  margin: 0;
  padding: 0;
  font-size: 0.80rem;
  font-weight:500;
}
`;

const FilterOptionsContainer = styled.div`
  width: 200px;
  height: 100vh;
  padding: 65px 10px;
  margin: 0 10px;
  overflow-y: auto;
  
  h5 {
    font-size: 0.8rem;
    font-weight: 600;
    padding-block-start: 10px;
  }
  
  select {
    margin: 10px 0;
    width: 100%;
  }

  @media screen and (max-width: 760px) {
    width: 250px;
`;

const PlayerCardContainer = styled.div`
  border: 1px solid #ddd;
  margin: 10px;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  flex-direction: column;
  border-radius: 12px;

  &:hover {
    background-color: #f2f2f2;
  }
`;

const PlayerHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;
const PlayerContent = styled.div`
  display: flex;
  justify-content:space-between;
  align-items: center;
`;
const PlayerName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const PlayerDetails = styled.div`
  margin-bottom: 5px;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: bold;

  @media screen and (max-width: 760px) {
    flex-direction: column;
    gap: 7px;
  }
`;

const RatingContainer = styled.div`
  border: 1px solid #ddd;
  width: 45px;
  padding: 5px 15px;
  border-radius: 6px;
  font-size: 12px;
`;

const RatingSingles = styled(FaUser)`
  font-size: 16px;
`;

const RatingDoubles = styled(FaUserGroup)`
  font-size: 16px;
`;

const UserImage = styled(FaCircleUser)`
  font-size: 30px;
  color: #003977;
  margin-inline-end: 20px;
  
  @media screen and (max-width: 760px) {
    margin-inline-end: 10px;
  }
`;

const FilterIcon = styled(IoFilter)`
  font-size: 16px;
  cursor: pointer;
  margin-left: 10px;
`;

const Modal = styled.div`
  display: ${(props) => (props.visible ? "flex" : "none")};
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
`;

const ModalContent = styled.div`
  background-color: #fefefe;
  margin: 5% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 60%;
`;

const CloseButton = styled.span`
  color: red;
  float: right;
  font-size: 28px;
  font-weight: bold;

  &:hover {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
`;

const ModalHeader = styled.h2`
  margin-bottom: 20px;
`;

const ModalDetails = styled.p`
  margin-bottom: 10px;
`;

const closeButtonStyle = {
  alignSelf: 'flex-end',
  marginRight: '0px',
  color: 'white',
  fontSize: 'inherit',
  cursor: 'pointer',
  marginBottom: '25px',
  fontWeight: 'Bold',
  width: '50px',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  padding: '7px',
};

const filterFullScreen = {
  padding: '10px',
  margin: '0 10px',
  position: 'fixed',
  top: 0,
  left: 70,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgb(51,51,51)',
  zIndex: 9999,
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
};

export {
  Container,
  PlayerListContainer,
  StickySearchBar,
  AutosuggestWrapper,
  StyledLink,
  FilterOptionsContainer,
  PlayerCardContainer,
  PlayerHeader,
  PlayerContent,
  PlayerName,
  PlayerDetails,
  Rating,
  RatingContainer,
  RatingSingles,
  RatingDoubles,
  UserImage,
  FilterIcon,
  Modal,
  ModalContent,
  CloseButton,
  ModalHeader,
  ModalDetails,
  closeButtonStyle,
  filterFullScreen,
};

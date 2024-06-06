import styled from 'styled-components';
import { FaUser, FaUserGroup, FaArrowLeft } from "react-icons/fa6";

const Form = styled.form`
  width: 100%;
  max-width: 600px;
  padding: 30px 50px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
  @media (max-width: 450px) {
    h2 {
      font-size: 20px;
    }
    div {
      display: flex;
      flex-direction: column;
      align-items: center; // Center items horizontally
    }
    div h3 {
      font-size: 18px;
    }
    div button {
      display: block;
    }
    .col input {
      font-size: 10px;
    }
  }
`;

const MainContainer = styled.main`
  display: flex;  
  flex-direction: row;
  justify-content: space-between;
  background-color: rgba(205, 209, 228, .3);
  height: 100%;

  @media (max-width: 768px) {
  height: 100%;
  }
`;

const ProfileInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  flex: 1;
  alignItems: center;
`;

const Label = styled.label`
  font-weight: bold;
  flex: 0.5;
  text-align: left;
  margin-right: 10px;
  margin-bottom: 10px;
  width: 120px;

  @media (max-width: 768px) {
    width: 120px;
  }
`;

const Data = styled.span`
  display: flex;
  flex: 1.5;
  margin-left: 0px;

  @media (max-width: 768px) {
    margin-left: 10px;
  }
`;

const FormRow = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  alignItems: center;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  width: 300px;
  padding: 5px;
  font-size: 16px;
  margin-left: 40px;

  @media (max-width: 768px) {
    width: 150px;
  }
`;

const CustomSelect = styled.select`
  width: 300px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-left: 40px;
  margin-bottom: 5px;
  font-size: 16px;

  @media (max-width: 768px) {
    width: 150px;
    margin-left: 20px;
  }
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  padding: 20px;
  flex-direction: row;
  width: calc(100% - 250px);
  height: 100%;
  align-items: baseline;

  @media (max-width: 768px) {
      flex-direction: column;
      align-items: normal;
    }
`;

const UserProfileContainer = styled.div`
  flex: 1;
  padding: 20px;
  p{
    margin: 2px 0;
    font-size: 0.75rem;
  }
  h2{
    margin-block-end: 2px;
  }
  .outcome_cont{
    font-size:1.2rem;
  }
`;
const UserProfilePerformance = styled.div`
  width: 35%;
  margin: 2rem auto;

  @media (max-width: 820px) {
    width: 70%;
  }

  @media (min-width: 768px) {
      display:flex;
      justify-content:space-around;
    }
`;
const MatchHistoryContainer = styled.div`
  flex: 1;
  padding: 20px;
  height: auto;
  width:100%;
  @media (max-width: 768px) {
    padding: 0 10px;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    span{
     margin-inline-start: 20px;
    }
  }
h2{
  text-align: center;
  margin-block-end: 10px;
}
  p {
    margin: 0;
  }
  .player__matches{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0;
  }
`;

const MatchCardContainer = styled.div`
  border: 1px solid #ccc;
  background-color:#fff;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;

`;

const WinMatchHistoryContainer = styled.div`
  .outcome {
    color: rgba(60, 219, 123, 1);
  }
`;

const LossMatchHistoryContainer = styled.div`
  .outcome {
    color: rgba(255, 92, 92, 1);
  }
`;

const DrawMatchHistoryContainer = styled.div`
  .outcome {
    color: rgba(204, 204, 204, 1);
  }
`;
const BackIcon = styled(FaArrowLeft)`
cursor: pointer;
font-size: 2rem;
margin-right: 15px;
color: #333;
`;

const Rating = styled.div`
  display: flex;
  gap: 15px;
  font-weight: Bold;
  margin-block-end: 20px;
  

  @media (max-width: 768px) {
    max-width: 400px;
    width: auto;
  }

  @media (max-width: 450px) {
    gap: 40px;
  }
`;
const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #003977;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 18px;
  color: white;
  text-align: center;
  gap: 10px;
  width: 200px;

  @media (max-width: 450px) {
    width: 100px;
    margin-left: -30px;
    font-weight: 400;
  }
`;
const RatingSingles = styled(FaUser)`
  font-size: 16px;
  vertical-align: middle;
  margin-bottom: 7px;
`;

const RatingDoubles = styled(FaUserGroup)`
  font-size: 16px;
  vertical-align: middle;
  margin-bottom: 7px;
`;

const buttonContainer = {
  display: 'flex',
  marginTop: '16px',
  justifyContent: 'center',
};

const button = {
  padding: '8px 16px',
  fontSize: '16px',
  borderRadius: '4px',
  cursor: 'pointer',
  width: '150px',
  marginRight: '20px'
};

export {Form, MainContainer, ProfileInfoContainer, InputContainer, Input, CustomSelect, InfoRow, Label, Data, FormRow, buttonContainer, button, Container, UserProfileContainer, UserProfilePerformance, Rating, BackIcon, RatingContainer, RatingSingles, RatingDoubles, MatchHistoryContainer, WinMatchHistoryContainer, LossMatchHistoryContainer, DrawMatchHistoryContainer, MatchCardContainer}
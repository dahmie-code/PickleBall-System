import styled from "styled-components";
import { FaCheckCircle } from "react-icons/fa";


const MainContainer = styled.main`
background-color: #f3f4f6;
min-height: 100vh;
padding: 30px 0;
display: flex;
justify-content: center;
align-items: center;  
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  width: 50%;
  max-width: 500px;
  background-color: #fff;
  margin: auto;
  padding: 20px;
  box-shadow: 0px 10px 15px 0px rgba(0,0,0,0.1);
  border-radius: 2rem;

  h2 {
    margin-bottom: 15px;
    font-size: 1.5em;
    text-align: center;
  }

.selectGame__type{
    width: 100%;
    border-radius: 4px;
    padding:8px;
    margin-top: 5px;
    cursor:pointer;
    border: 1px solid #ccc;

}
  .match__date,
  .team__score {
    margin-bottom: 15px;
  }

  label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  select,
  ul,
  .game__type,
  .team__score input {
    margin-top: 5px;
  }
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    margin-top: 5px;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 5px;
  }

  p {
    color: red;
    margin: 5px 0;
  }
  @media (max-width: 768px) {
    width: 70%;
  }
`;

const PlayerInputContainer = styled.div`
  position: relative;

  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    outline: none;
    border-radius: 4px;
    box-sizing: border-box;
    margin-top: 5px;
  }

  .selected__players{
    margin-bottom: 10px;
    ul {
        width: 100%;
        background-color: #fff;
        border: none;
        list-style: none;
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin: 0;
        padding: 0;
        z-index: 1;
    
        li {
          padding: 5px 8px;
          cursor: pointer;
          background-color: #003977;
          color: #fff;
          border-radius: 5px;    
          &:hover {
            background-color: #59d2fe;
            color: #f5f5dc;
          }
        }
      }
  }
  .delete__icon {
    cursor: pointer;
    color: #ff474c;
    margin-left: 5px;
    font-size: 1em;
    transition: color 0.3s;

    &:hover {
      color: #8b0000;
    }
  }
  .delete__icon.disabled {
    color: #ccc;
    display: none;

    &:hover {
      color: #ccc;
    }
  }
  .delete__icon.nonOrganizerColor {
    color: #ff474c;
  }  
`;

const StyledButton = styled.button`
  background-color: #003977;
  color: #fff;
  padding: 10px;
  border: none;
  outline:none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #002855;
  }
`;
const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const Card = styled.div`
  background: #fff;
  color: #3A5F0B;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
`;
const SuccessIcon = styled(FaCheckCircle)`
  color: #00cc00;
  font-size: 4em;
  margin: 10px 0;
`;

const CloseButton = styled.button`
  background-color: #003977;
  color: #fff;
  padding: 10px;
  border: none;
  outline: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #002855;
  }
`;
export {MainContainer, FormContainer, PlayerInputContainer, StyledButton, ModalContainer, Card, SuccessIcon, CloseButton}
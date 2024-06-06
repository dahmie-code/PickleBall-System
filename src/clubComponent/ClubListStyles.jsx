import styled from 'styled-components';
import { MdClose, MdKeyboardBackspace, MdExpandMore } from 'react-icons/md';
import { FaUser, FaUserGroup } from "react-icons/fa6";


const ClubListContainer = styled.main`
display: flex;
background-color: rgba(205, 209, 228, .3);
.clubLists__wrapper{
    width: 100%;
    margin: 0 25px;
    display: flex;
    flex-direction: column;
    @media (max-width: 768px) {
      margin: 0 15px;
    }
}
.club__input{
    width: 100%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    border: none;
    outline: none;
    padding: 10px;
}
h1, h3{
    margin-bottom: 10px;
}
h3{
    font-size: 1.2rem;
}
.create-club-button {
  align-self: flex-end;
  margin-top: 20px;
  width: auto;
  color: #fff;
  background-color: #003977;
  border: none;
  padding: 10px 15px;
  outline: none;
  border-radius: 10px;
  cursor: pointer;
  &:hover{
    background-color: #144880;
    }
}
.form__container{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  height: auto;
  margin-bottom: 10px;

  .column {
    width: 250px;
  }
  
  .form__input {
    display: grid;
    flex-direction: column;
    gap: 15px;
    flex-basis: calc(50% - 7.5px);

    .error-message{
      color: #b53737;
      font-size: 12px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-size: .95rem;
    }

    .row {
      margin: 0px 15px;
      flex-wrap: wrap;
    }

    input, select {
      width: 250px;
      border-radius: 8px;
      outline: none;
      padding: 8px;
    }

    select {
      margin-left: 0px;
    }

    @media (max-width: 768px) {
        align-items: center;
        margin-bottom: 0px;
        gap: 5px;
        
        input, select {
          width: 200px;
          margin-bottom: 0px;
        }
        label {
          margin-left: 20px;
          margin-top: 2px;
        }
    }
  }
}

.form__input-container {
  display: flex;
  gap: 5px;
  margin-left: 10px;
  .form__input{
    flex-basis: calc(50% - 7.5px);
    label {
      display: block;
      margin-bottom: 5px;
      font-size: .95rem
    }

    input {
      width: 85%;
      border-radius: 8px;
      outline: none;
      padding: 8px;
    }
  }

  @media (max-width: 768px) {
    gap: 5px;
    flex-direction: column;
    .form__input{
      label {
        margin-bottom: 0px;
        margin-top: 5px;
      }
      input {
        width: 200px;
      }
    }
  }
}


button[type="button"], button[type="submit"] {
  margin-top: 15px;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  width: auto;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

button[type="button"] {
  background-color: rgba(20, 72, 128, 0.9);
  color: #fff;
  &:hover {
    background-color: #003977;
  }
}

button[type="submit"] {
  background-color: #003977;
  color: #fff;
  &:hover {
    background-color: rgba(20, 72, 128, 0.9);
  }
}
`;
const ClubContainer = styled.div`
margin-top: 15px;
.club-link {
    text-decoration: none;
  }

  .club-card {
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    transition: box-shadow 0.3s ease-in-out;
    height: 100%;
    &:hover {
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }

    h3 {
        font-size: 14px;
        margin-bottom: 5px;
    }

    p {
      color: #777;
    }
    small, p.member-count{
        color: #333;
        font-size: 0.85rem;
        font-weight: 200;
        margin: 0;
    }
  }
`;

const ClubGrid = styled.div`
.club-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
`;
// const JoinClub = styled(MdGroupAdd)`
// font-size: 1.5rem;
// transition: all .3s ease-in-out;
// margin-left: 20px;
// &:hover{
//     color: #ff6b81;
//     }
// `;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-content{
    height: 75vh;
    overflow-y:scroll;
    p{
      color: #000;
    }
    h3{
      text-align:center;
    }
    ul{
      list-style: none;
      padding: 0;
      li{
        border: 1px solid #ccc;
        padding: 10px;
        margin: 10px 0;
        .request-header{
          display:flex;
          justify-content: space-between;
          align-items: center;
        }
    }
  }
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  position: relative;
  width: 80%;
  max-width: 600px;
  h2{
    font-size: 1.5rem;
    font-weight: 600;
    margin: 10px 0;
    }
  p{
    font-size: 1rem;
    color: #2ecc71; 
  }

`;
const ModalForm = styled.form`
height: 80vh;
overflow-y: scroll;
`;
const CloseIcon = styled(MdClose)`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.5rem;
  color: #333;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #ff6b81;
  }
`;

const BackIcon = styled(MdKeyboardBackspace)`
cursor: pointer;
font-size: 2rem;
margin-right: 15px;
color: #333;
`;

const ClubDetailsContainer = styled.div`
  padding: 0 30px;
  background-color: rgba(205, 209, 228, .3);
  height:100vh;

    h3 {
    margin-bottom: 15px;
  }
 h2{
  font-size: 1.5rem;
  margin-bottom: 0;
 }
 .club-details__header{
  display: flex;
  align-items: center;
  padding-top: 25px;
 }
 @media (max-width: 768px) {
  height: auto;
}
`;
const JoinLeaveButton = styled.button`
  color: #fff;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  width: auto;

  &:hover {
    background-color: #2980b9;
  }
`;
const ClubName = styled.div`
display: flex; 
justify-content: space-between;
margin-bottom: 20px;
`;

const ClubContact = styled.div`
display: flex;
justify-content: space-between;
align-items: flex-start; 
@media (max-width: 768px) {
  flex-direction: column-reverse;
  align-items: stretch; 
}

.club__contact {
  background-color: #fff;
  padding: 35px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    display: none;
    text-align: center;
    &.show {
      display: block;
      ul{
        display:flex;
        justify-content:space-between;
      }
    }
  }
  @media (max-width: 500px) {
    display: none;
    &.show {
      display: block;
      ul{
display: block;
      }
    }
  }
  p {
    margin-bottom: 10px;
  }
.club__contact-Info{
  margin-bottom: 25px;
}
  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 15px;
    }
  }
}
.club__contact-toggle {
  display: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #333;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #ff6b81;
  }

  @media (max-width: 768px) {
    display: block;
    align-self: flex-end;
  }
}
`;
const MemberCard = styled.div`
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 15px;
  width: 100%;
  .member__details{
    p{
      font-size: 0.85rem;
      font-weight: 500;
    }
  }
  p {
    font-size: 1.2rem;
    font-weight: 600;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 10px;
    }
  }
`;
const ClubMembers = styled.div`
width: 70%;

@media (max-width: 768px) {
  width: 100%;
}
`;
const MemberCardHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Rating = styled.div`
  display: flex;
  gap: 15px;
  font-weight: bold;
`;
const RatingContainer = styled.div`
background-color: #eee;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 45px;
  padding: 5px 15px;
  border-radius: 6px;
  font-size: 12px;
  text-align:center;
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

export {ClubListContainer, ClubContainer, ClubGrid, ModalContainer, ModalContent, ModalForm, CloseIcon,BackIcon, ClubDetailsContainer, ClubName, ClubContact, MemberCard, ClubMembers, MemberCardHeader,  Rating, RatingContainer, RatingSingles, RatingDoubles, JoinLeaveButton, MdExpandMore}